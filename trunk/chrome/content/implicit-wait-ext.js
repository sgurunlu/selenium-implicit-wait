


/**
 * @Author : Florent BREHERET
 * @Function : Activate an implicite wait on action commands when trying to find elements.
 * @Exemple 1 : setImplicitWaitLocator | 0
 * @Exemple 1 : setImplicitWaitLocator | 1000
 */
Selenium.prototype.doSetImplicitWaitLocator = function(timeout){
	if( !editor.implicitwait ) throw new SeleniumError("setImplicitWaitLocator works on Selenium IDE only ! ");
	if( timeout==0 ) {
		editor.implicitwait.Timeout=0;
		editor.implicitwait.IsImplicitWaitLocatorActivated=false;
	}else{
		editor.implicitwait.Timeout=timeout;
		editor.implicitwait.IsImplicitWaitLocatorActivated=true;
	}
};
/**
 
 
 * @author : Florent BREHERET
 * @Function : Activate an implicite wait for condition before commands are executed.
 * @Param scope : <testcase> for this testcase only, <testsuite> for all testcases and <null> to remove the condition
 * @Param condition_js : Javascript logical expression that need to be true to execute each command.
 *
 * @Exemple 0 : setImplicitWaitCondition |  0  |  
 * @Exemple 1 : setImplicitWaitCondition |  1000  | (typeof window.Sys=='undefined') ? true : window.Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack()==false;
 * @Exemple 2 : setImplicitWaitCondition |  1000  | (typeof window.dojo=='undefined') ? true : window.dojo.io.XMLHTTPTransport.inFlight.length==0;
 * @Exemple 3 : setImplicitWaitCondition |  1000  | (typeof window.Ajax=='undefined') ? true : window.Ajax.activeRequestCount==0;
 * @Exemple 4 : setImplicitWaitCondition |  1000  | (typeof window.tapestry=='undefined') ? true : window.tapestry.isServingRequests()==false;
 * @Exemple 4 : setImplicitWaitCondition |  1000  | (typeof window.jQuery=='undefined') ? true : window.jQuery.active==0;
 */
Selenium.prototype.doSetImplicitWaitCondition = function( timeout, condition_js ) {
	if( !editor.implicitwait ) throw new SeleniumError("setImplicitWaitCondition works on Selenium IDE only ! ");
	if( timeout==0 ) {
		editor.implicitwait.Timeout=0;
		editor.implicitwait.implicitAjaxWait_Condition=null;
		editor.implicitwait.IsImplicitWaitAjaxActivated=false;
	}else{
		editor.implicitwait.Timeout=timeout;
		editor.implicitwait.implicitAjaxWait_Condition=condition_js;
		editor.implicitwait.IsImplicitWaitAjaxActivated=true;
	}
}