import cors from "cors";
import { UploadController } from "./controllers/UploadController.js";
import { ViewController } from "./controllers/ViewController.js";

/**
 * @type {UploadController}
 */
const uploadController = new UploadController();

/**
 * @type {ViewController}
 */
const viewController = new ViewController();


/**
 *	@param app
 *	@return {Promise<void>}
 */
export async function httpRoutes( app )
{
	//
	//	enable CORS for allowing requests from any origin
	//
	app.use( cors() );

	//
	//	setup routers
	//
	await uploadController.uploadSingleFile( `/upload`, app );
	await viewController.viewSingleFile( `/view`, app );
}
