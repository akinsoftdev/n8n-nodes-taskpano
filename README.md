# n8n-nodes-taskpano

This is the official n8n node for [TaskPano](https://taskpano.com), developed and maintained by [AKINSOFT](https://akinsoft.com.tr). It lets you use TaskPano in your n8n workflows.

TaskPano is a project management and task tracking application that helps teams organize, track, and manage their work efficiently.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Task

- **Add Assignee** - Add an assignee to a task
- **Add Checklist Item** - Add a checklist item to a task
- **Add Comment** - Add a comment to a task
- **Add Subscription** - Add a subscription to a task
- **Add Tag** - Add a tag to a task
- **Create Subtask** - Create a new subtask
- **Create Task** - Create a new task
- **Delete Attachment** - Delete an attachment from a task
- **Download Attachment** - Download an attachment from a task
- **Get Attachments** - Get all attachments of a task
- **Get Many** - Get multiple tasks with filters
- **Get Task** - Get a task by ID
- **Move Task** - Move a task to a different list
- **Remove Assignee** - Remove an assignee from a task
- **Remove Subscription** - Remove a subscription from a task
- **Remove Tag** - Remove a tag from a task
- **Update Checklist Item** - Update a checklist item subject
- **Update Checklist Item Status** - Update a checklist item status
- **Update Custom Field** - Update a custom field value on a task
- **Update Task** - Update a task
- **Upload Attachment** - Upload a file attachment to a task

### Project

- **Get Custom Fields** - Get all custom fields of a project
- **Get Participants** - Get all participants of a project

## Credentials

To use this node, you need to authenticate with TaskPano using an API Key.

### Getting your API Key

1. Log in to your TaskPano account at [app.taskpano.com](https://app.taskpano.com)
2. Navigate to your account settings
3. Generate a new API token
4. Copy the token and use it in your n8n credentials

### Setting up credentials in n8n

1. In n8n, go to **Credentials** > **New**
2. Search for "TaskPano API"
3. Enter your API Key
4. Save the credentials

## Compatibility

This node has been tested with n8n version 1.0 and above.

**Minimum n8n version:** 1.0.0

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [TaskPano API documentation](https://app.taskpano.com/api/docs)
- [TaskPano website](https://taskpano.com)

## License

[MIT](LICENSE.md)
