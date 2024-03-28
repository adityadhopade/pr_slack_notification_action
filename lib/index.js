"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const web_api_1 = require("@slack/web-api");
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
                            const slackClient = new web_api_1.WebClient(slackToken);
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
    }
    catch (error) {
        core.setFailed(`Error: ${error.message}`);
    }
}
// Run the action
run();
