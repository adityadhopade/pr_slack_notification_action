import * as core from '@actions/core';
import * as github from '@actions/github';
import { WebClient } from '@slack/web-api';

async function run() {
  try {
    // Get the GitHub token
    const githubToken = core.getInput('github-token');

    // Get the Slack token and channel
    const slackToken = core.getInput('slack-token');
    const slackChannel = core.getInput('slack-channel');

    // Create an Octokit instance using the GitHub token
    const octokit = github.getOctokit(githubToken);

    // Get the event payload
    const payload = github.context.payload;

    // Check if the event is an issue comment
    if (github.context.eventName === 'issue_comment') {
      // Check if it's associated with a pull request
      if (payload.issue && payload.issue.pull_request) {
        // Ensure payload.comment is defined
        if (payload.comment && payload.comment.id) {
          // Fetch the comment using GitHub's REST API
          const { owner, repo } = github.context.repo;
          const comment = await octokit.rest.issues.getComment({
            owner,
            repo,
            comment_id: payload.comment.id,
          });

          // Ensure comment.data.body is defined
          if (comment.data && comment.data.body) {
            const commentBody = comment.data.body.toLowerCase();

            // Check if the comment contains the word "bug"
            if (commentBody.includes('bug')) {
              // Initialize a Slack client
              const slackClient = new WebClient(slackToken);

              // Send a notification to Slack
              await slackClient.chat.postMessage({
                channel: slackChannel,
                text: `A bug has been mentioned in the PR: ${payload.issue.pull_request.html_url}`,
              });

              core.info('Slack notification sent successfully');
            }
          }
        }
      }
    }
  } catch (error: any) {
    core.setFailed(`Error: ${error.message}`);
  }
}

// Run the action
run();