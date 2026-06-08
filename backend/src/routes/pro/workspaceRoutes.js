const express = require('express');
const router = express.Router();
const workspaceController = require('../../controllers/pro/workspaceController');
const workspaceTaskController = require('../../controllers/pro/workspaceTaskController');
const workspaceCommentController = require('../../controllers/pro/workspaceCommentController');
const workspaceMemberController = require('../../controllers/pro/workspaceMemberController');
const authMiddleware = require('../../middleware/authMiddleware');
const proMiddleware = require('../../middleware/proMiddleware');

router.use(authMiddleware);
router.use(proMiddleware); // Yêu cầu gói Pro

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getMyWorkspaces);
router.get('/:id', workspaceController.getWorkspaceDetail);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

router.get('/:id/tasks', workspaceTaskController.getWorkspaceTasks);
router.post('/:id/tasks', workspaceTaskController.createWorkspaceTask);
router.post('/:id/tasks/batch', workspaceTaskController.createBatchTasks);
router.put('/:id/tasks/:taskId', workspaceTaskController.updateWorkspaceTask);
router.delete('/:id/tasks/:taskId', workspaceTaskController.deleteWorkspaceTask);

router.get('/:id/tasks/:taskId/comments', workspaceCommentController.getTaskComments);
router.post('/:id/tasks/:taskId/comments', workspaceCommentController.createTaskComment);

// router.get('/:id/events', workspaceController.getWorkspaceEvents); // Nếu có controller xử lý sự kiện

router.delete('/:id/members/:userId', workspaceMemberController.removeMember);
router.put('/:id/members/:userId/role', workspaceMemberController.updateMemberRole);

module.exports = router;
