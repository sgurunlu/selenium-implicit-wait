
Selenium.IMPLICIT_WAIT_DEFAULT_TIMEOUT=15000;

// hook Selenium.prototype.reset_extension on Selenium.prototype.reset function 
objectExtend(Selenium.prototype, {
  reset_testcase: Selenium.prototype.reset,
  reset: function() {
    var func = Selenium.prototype.reset_testcase;
    func.apply(this);
	this.reset_testcase_extension();
  }
});

Selenium.prototype.reset_testcase_extension = function(){
	switch (Editor.controller.runkind){
		case "cmd_selenium_play":
			try{
				currentTest.implicitElementWait_Timeout = null;
				currentTest.implicitAjaxWait_Timeout = null;
			} catch (e) {
				alert(e);
			}
			break;
		case "cmd_selenium_play_suite":
			try{
				IDETestLoop.prototype.implicitElementWait_Timeout = null;
				IDETestLoop.prototype.implicitAjaxWait_Timeout = null;
			} catch (e) {
				alert(e);
			}
			break;
	}
	Editor.controller.runkind=null;


}

if(!Editor.controller.doCommand_original){
	Editor.controller.doCommand_original=Editor.controller.doCommand;
	Editor.controller.doCommand= function(cmd){
		Editor.controller.runkind=cmd;
		Editor.controller.doCommand_original(cmd);
	}
}


/**
 * @Author : Florent BREHERET
 * @Description : Set the TIMEOUT value used by ImplicitWaitLocator and ImplicitWaitCondition. Default is 30000 millisecond.
 * @Param timeout_ms : a timeout in milliseconds.
 * @Exemple 1 : setImplicitWaitTimeOut |  1000  |
 */
Selenium.prototype.doSetImplicitWaitTimeOut = function(timeout_ms){
	if (isNaN(timeout_ms)) throw new SeleniumError("Timeout is not a number: " + timeout_ms);
	Selenium.IMPLICIT_WAIT_DEFAULT_TIMEOUT=timeout_ms;
	if( currentTest.implicitElementWait_Timeout != null) currentTest.implicitElementWait_Timeout = timeout_ms;
	if( currentTest.implicitAjaxWait_Timeout != null) currentTest.implicitAjaxWait_Timeout = timeout_ms;
	if( IDETestLoop.prototype.implicitElementWait_Timeout != null ) IDETestLoop.prototype.implicitElementWait_Timeout = timeout_ms;
	if( IDETestLoop.prototype.implicitAjaxWait_Timeout != null ) IDETestLoop.prototype.implicitAjaxWait_Timeout = timeout_ms;
}


/**
 * @Author : Florent BREHERET
 * @Function : Activate an implicite wait on action commands when trying to find elements.
 * @Param scope : <testcase> for this testcase only, <testsuite> for all testcases and <null> to remove the condition
 * @Exemple 1 : setImplicitWaitLocator | testcase
 * @Exemple 1 : setImplicitWaitLocator | testsuite
 * @Exemple 1 : setImplicitWaitLocator | null
 */
Selenium.prototype.doSetImplicitWaitLocator = function(scope){
	if(scope!='testsuite' && scope!='testcase' && scope!='null' ) throw new SeleniumError("scope can only be set with <testcase>, <testsuite> and <null> to disable ImplicitWaitLocator");
	if( scope=='null' ) {
		currentTest.implicitElementWait_Timeout = null;		
		IDETestLoop.prototype.implicitElementWait_Timeout = null;
	}else{
		selenium.browserbot.findElement = Override_BrowserBot_findElement;
		currentTest.implicitElementWait_Timeout = Selenium.IMPLICIT_WAIT_DEFAULT_TIMEOUT;
		if(scope=='testsuite'){
			PageBot.prototype.findElement = Override_BrowserBot_findElement;
			IDETestLoop.prototype.implicitElementWait_Timeout = Selenium.IMPLICIT_WAIT_DEFAULT_TIMEOUT;
			//BrowserBot.prototype.findElement = Override_BrowserBot_findElement;
		}
	}
};


/**
 * @author : Florent BREHERET
 * @Function : Activate an implicite wait for condition before commands are executed.
 * @Param scope : <testcase> for this testcase only, <testsuite> for all testcases and <null> to remove the condition
 * @Param condition_js : Javascript logical expression that need to be true to execute each command.
 *
 * @Exemple 0 : setImplicitWaitCondition |  testcase  |  1==1  
 * @Exemple 1 : setImplicitWaitCondition |  testsuite | (typeof window.Sys=='undefined') ? true : window.Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack()==false;
 * @Exemple 2 : setImplicitWaitCondition |  testcase  | (typeof window.dojo=='undefined') ? true : window.dojo.io.XMLHTTPTransport.inFlight.length==0;
 * @Exemple 3 : setImplicitWaitCondition |  testcase  | (typeof window.Ajax=='undefined') ? true : window.Ajax.activeRequestCount==0;
 * @Exemple 4 : setImplicitWaitCondition |  testcase  | (typeof window.tapestry=='undefined') ? true : window.tapestry.isServingRequests()==false;
 * @Exemple 4 : setImplicitWaitCondition |  testcase  | (typeof window.jQuery=='undefined') ? true : window.jQuery.active==0;
 */
Selenium.prototype.doSetImplicitWaitCondition = function( scope, condition_js ) {
	var window = this.browserbot.getCurrentWindow();
	if (scope!='testsuite' && scope!='testcase' && scope!='null'  ) throw new SeleniumError("scope argument error. Allowed arguments : <testcase>, <testsuite> and <null> to disable ImplicitWaitLocator");
	if( scope=='null' ) {
		IDETestLoop.prototype.implicitAjaxWait_Timeout = null;
		currentTest.implicitAjaxWait_Timeout = null;
	}else{
		var ret;
		try{
			ret=selenium.getEval(condition_js);
		} catch (e) {
			throw new SeleniumError( e.message );
		}	
		if(ret!=true) throw new SeleniumError("Javascript condition must be true. Result is : " + ret );
		currentTest.implicitAjaxWait_Timeout = Selenium.IMPLICIT_WAIT_DEFAULT_TIMEOUT;
		currentTest.implicitAjaxWait_Condition = condition_js;
		currentTest.resume = Override_TestLoop_resume;
		if(scope=='testsuite'){
			IDETestLoop.prototype.implicitAjaxWait_Timeout = Selenium.IMPLICIT_WAIT_DEFAULT_TIMEOUT;
			IDETestLoop.prototype.implicitAjaxWait_Condition = condition_js;
			IDETestLoop.prototype.resume = Override_TestLoop_resume;
			//TestLoop.prototype.resume = Override_TestLoop_resume;
		}
	}	
}

var Override_BrowserBot_findElement = function (locator, win){
   var element = this.findElementOrNull(locator, win);
   if (element == null) {
		throw {
			isFindElementError: true,
			message: "Element " + locator + " not found"
		}
   }
   return core.firefox.unwrap(element);
}

var Override_TestLoop_resume = function(){
	try {
		if(this.abord) return;
		if(editor.selDebugger.state == Debugger.PAUSE_REQUESTED){
			this.currentCommand.implicitAjaxWait_EndTime=null;
			this.currentCommand.implicitElementWait_EndTime=null;
			return this.continueTestAtCurrentCommand();
		}
		if (this.implicitAjaxWait_Timeout && !this.currentCommand.implicitElementWait_EndTime) {
			if( !this.currentCommand.implicitAjaxWait_EndTime ){
					this.currentCommand.implicitAjaxWait_EndTime = getImplicitWaitTimeoutTime();
					return window.setTimeout(fnBind(this.resume, this), 3);
			}
			if (new Date().getTime() > this.currentCommand.implicitAjaxWait_EndTime) {
				throw new SeleniumError("Timeout reached while waiting for condition \"" + this.implicitAjaxWait_Condition  + "\"");
			}else{
				try{
					ret=selenium.getEval(this.implicitAjaxWait_Condition);
				} catch (e) {
					throw new SeleniumError("ImplicitWaitCondition failed : " + e.message );
				}
				if(!ret) return window.setTimeout(fnBind(this.resume, this), 20);
			}
		}
		if(this.implicitElementWait_Timeout){
			if(this.currentCommand.implicitElementWait_EndTime == undefined){
				this.currentCommand.implicitElementWait_EndTime = getImplicitWaitTimeoutTime();
			}
		}
		selenium.browserbot.runScheduledPollers();
		this._executeCurrentCommand();
		this.continueTestWhenConditionIsTrue();
	} catch (e) {
		if(e.isFindElementError ){
			if( new Date().getTime() < this.currentCommand.implicitElementWait_EndTime){
				if(!this.backup_log_function) {
					this.backup_log_function=LOG.info;
					LOG.info = function(){};
				}
				return window.setTimeout(fnBind(this.resume, this), 20);
			}else{
				this._handleCommandError( SeleniumError("Timeout reached while waiting for locator. " + e.message ) );
				this.testComplete();
			}
		}else{
			if (!this._handleCommandError(e)) {
				this.testComplete();
			} else {
				this.continueTest();
			}
		}
	}
	if(this.backup_log_function) LOG.info=this.backup_log_function;
}

function getImplicitWaitTimeoutTime(){
	var endtime=new Date().getTime() + parseInt(Selenium.IMPLICIT_WAIT_DEFAULT_TIMEOUT * 0.8);
	return endtime;
}