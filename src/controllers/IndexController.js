import { WebUtil } from "denetwork-utils";


/**
 * 	@class
 */
export class IndexController
{
	static async index( req, res )
	{
		try
		{
			res.status( 200 ).send( WebUtil.getResponseObject( 200, {
				title: 'Your are welcome!' } )
			);
		}
		catch ( err )
		{
			res.status( 500 ).send( WebUtil.getResponseObject( 500, {},
				{ error : err }
			) );
		}
	}
}
