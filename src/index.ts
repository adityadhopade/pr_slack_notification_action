import * as core from '@actions/core';
import * as github from '@actions/github';
import axios from 'axios'; // Import Axios for making HTTP requests

async function run() {
  try {
    // Get the GitHub token
    const githubToken = core.getInput('github-token');

    // Get the Slack webhook URL and channel
    const slackWebhookUrl = core.getInput('slack-webhook-url');
    const slackChannel = core.getInput('slack-channel');

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
          const comment = await github.getOctokit(githubToken).rest.issues.getComment({
            owner,
            repo,
            comment_id: payload.comment.id,
          });

          // Ensure comment.data.body is defined
          if (comment.data && comment.data.body) {
            const commentBody = comment.data.body.toLowerCase();

            // Check if the comment contains the word "bug"
            if (commentBody.includes('bug')) {
              // Prepare message for Slack
              const message = `A bug has been mentioned in the PR: ${payload.issue.pull_request.html_url}`;

              // Send a notification to Slack using the webhook URL
              await axios.post(slackWebhookUrl, {
                channel: slackChannel,
                text: message,
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