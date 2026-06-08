const express = require('express');
const router = express.Router();
const inviteController = require('../../controllers/pro/inviteController');
const authMiddleware = require('../../middleware/authMiddleware');
const proMiddleware = require('../../middleware/proMiddleware');

router.use(authMiddleware);

// Lấy danh sách lời mời của chính mình, chấp nhận, từ chối (không cần Pro)
router.get('/', inviteController.getMyInvites);
router.post('/:token/accept', inviteController.acceptInvite);
router.post('/:token/reject', inviteController.rejectInvite);

// Mời người khác và hủy lời mời (yêu cầu Pro và phải gọi vào route có workspace id / params ở ngoài, hoặc viết gộp ở đây)
// Do inviteMember cần workspace_id, nên ta để ở đây và nhận tham số qua param hoặc đưa vào workspaceRoutes. 
// Ở plan, ta dự kiến route: POST /api/workspaces/:id/invite -> Đã được liệt kê trong workspaceRoutes, 
// Tuy nhiên để code gọn, ta có thể gắn vào workspaceRoutes hoặc tạo riêng.
// Ở đây tạo route rời cho inviteMember (VD: POST /api/invites/workspaces/:id) 
// Nhưng theo thiết kế ở trên, ta sẽ map nó vào /api/workspaces/:id/invite ở server.js hoặc tại đây.

router.post('/workspaces/:id', proMiddleware, inviteController.inviteMember);
router.delete('/:id', proMiddleware, inviteController.cancelInvite);

module.exports = router;
