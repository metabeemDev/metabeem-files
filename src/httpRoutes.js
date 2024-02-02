import cors from "cors";
import { UploadController } from "./controllers/UploadController.js";
import { ViewController } from "./controllers/ViewController.js";
import { IndexController } from "./controllers/IndexController.js";

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
	//	index
	//
	app.get( '/', IndexController.index );
	app.post( '/', IndexController.index );

	//
	//	setup routers
	//
	await uploadController.uploadSingleFile( `/upload`, app );
	await viewController.viewSingleFile( `/view`, app );
}
