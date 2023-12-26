import _ from "lodash";

export class StringUtil
{
	static removeDoubleQuotesAtBothEnds( str )
	{
		if ( _.isString( str ) )
		{
			return str.replace( /^"|"$/g, '' );
		}

		return null;
	}
}
