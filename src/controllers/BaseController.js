import { AzureBlobService } from "../AzureBlobService.js";


export class BaseController
{
	constructor()
	{
		this.azureBlobService = new AzureBlobService();
	}
}
