import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getMyAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.use(verifyJWT); 

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "photo",
                maxCount: 1,
            },

        ]),
        publishAVideo
    );

router.route("/my").get(getMyAllVideos);

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("photo"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router