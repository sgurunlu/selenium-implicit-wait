
function ImplicitWait(editor) {
	var self=this;
	this.editor = editor;
	this.HouglassButtonChecked = false;
	this.IsImplicitWaitLocatorActivated = false;
	this.IsImplicitWaitAjaxActivated = false;
	this.implicitAjaxWait_Condition=null;
	this.Timeout=0;
	this.EnableLog=true;
	editor.app.addObserver({
		testSuiteChanged: function(testSuite) {
			if (!self.editor.selDebugger.isHooked) {
				self.editor.selDebugger.isHooked = self.HookAnObjectMethodAfter(self.editor.selDebugger, 'init', self, self.InstallMethods);
			}
		}
	});
	self.HookAnObjectMethodBefore(Editor.controller, 'doCommand', self, self.Editor_doCommand_hooked);
}

ImplicitWait.prototype.Editor_doCommand_hooked = function( object, arguments ) {
	switch (arguments[0]) {
		case "cmd_selenium_play":
		case "cmd_selenium_play_suite":
		case "cmd_selenium_reload":
			this.Timeout=this.editor.getOptions().timeout;
			this.IsImplicitWaitLocatorActivated = this.HouglassButtonChecked;
			this.IsImplicitWaitAjaxActivated = false;
		break;
	}
	return true;
};

ImplicitWait.prototype.InstallMethods = function( object, arguments, retvalue  ) {
	object.runner.LOG.debug('Implicit wait installation');
	object.runner.IDETestLoop.prototype.resume = Function_Override_TestLoop_resume;
	object.runner.IDETestLoop.prototype.getImplicitWaitTimeoutTime = Function_TestLoop_getImplicitWaitTimeoutTime;
	object.runner.PageBot.prototype.findElement = Function_Override_BrowserBot_findElement;
	this.HookAnObjectMethodBefore(object.runner.LOG, 'log', this, function(){return this.EnableLog} );
};

ImplicitWait.prototype.toggleImplicitWaitButton = function(button) {
	button.checked = !button.checked;
	this.HouglassButtonChecked = button.checked;
	this.IsImplicitWaitLocatorActivated = this.HouglassButtonChecked;
};

var Function_Override_BrowserBot_findElement = function (locator, win){
	var element = this.findElementOrNull(locator, win);
	if (element == null) {
		throw {
			isFindElementError: true,
			message: "Element " + locator + " not found"
		}
	}
	return core.firefox.unwrap(element);
};

var Function_Override_TestLoop_resume = function() {
	try {
		var self=this;
		if(this.abord) return;
		if(editor.selDebugger.state == Debugger.PAUSE_REQUESTED){
			return this.continueTestAtCurrentCommand();
		}
		if (editor.implicitwait.IsImplicitWaitAjaxActivated && !this.currentCommand.implicitElementWait_EndTime) {
			if( !this.currentCommand.implicitAjaxWait_EndTime ){
					this.currentCommand.implicitAjaxWait_EndTime = this.getImplicitWaitTimeoutTime();
					return window.setTimeout( function(){return self.resume.apply(self);}, 3);
			}
			if (new Date().getTime() > this.currentCommand.implicitAjaxWait_EndTime) {
				throw new SeleniumError("Implicit wait Timeout reached while waiting for condition \"" + editor.implicitwait.implicitAjaxWait_Condition  + "\"");
			}else{
				try{
					ret=eval(editor.implicitwait.implicitAjaxWait_Condition);
					//ret=(function(condition){return eval(condition);}).call(editor.selDebugger.runner.selenium, editor.implicitwait.implicitAjaxWait_Condition)
				} catch (e) {
					throw new SeleniumError("ImplicitWaitCondition failed : " + e.message );
				}
				if(!ret) return window.setTimeout( function(){return self.resume.apply(self);}, 20);
			}
		}
		if(editor.implicitwait.IsImplicitWaitLocatorActivated){
			if(this.currentCommand.implicitElementWait_EndTime == undefined){
				this.currentCommand.implicitElementWait_EndTime = this.getImplicitWaitTimeoutTime();
			}
		}
		editor.selDebugger.runner.selenium.browserbot.runScheduledPollers();
		this._executeCurrentCommand();
		this.continueTestWhenConditionIsTrue();
	} catch (e) {
		if(e.isFindElementError){
			if(editor.implicitwait.IsImplicitWaitLocatorActivated){
				if( new Date().getTime() < this.currentCommand.implicitElementWait_EndTime){
					editor.implicitwait.EnableLog = false;
					return window.setTimeout( function(){return self.resume.apply(self);}, 20);
				}else{
					e = SeleniumError( "Implicit wait timeout reached. " + e.message );
				}
			}else{
				e = SeleniumError( e.message );
			}
		}
		editor.implicitwait.EnableLog = true;
		if(!this._handleCommandError(e)){
			this.testComplete();
		}else {
			this.continueTest();
		}
	}
	editor.implicitwait.EnableLog = true;
};

var Function_TestLoop_getImplicitWaitTimeoutTime = function(){
	var endtime=new Date().getTime() + parseInt(editor.implicitwait.Timeout * 0.8);
	return endtime;
};

ImplicitWait.prototype.HookAnObjectMethodBefore = function(ClassObject, ClassMethod, HookClassObject, HookMethod) {
  if (ClassObject) {
	var method_id = ClassMethod.toString() + HookMethod.toString();
    if (!ClassObject[method_id]) {
	  ClassObject[method_id] = ClassObject[ClassMethod];
	  ClassObject[ClassMethod] = function() {
		if( HookMethod.call(HookClassObject, ClassObject, arguments )==true ){
			return ClassObject[method_id].apply(ClassObject, arguments);
		}
      }
	  return true;
    }
  }
  return false;
};

ImplicitWait.prototype.HookAnObjectMethodAfter = function(ClassObject, ClassMethod, HookClassObject, HookMethod) {
  if (ClassObject) {
	var method_id = ClassMethod.toString() + HookMethod.toString();
    if (!ClassObject[method_id]) {
	  ClassObject[method_id] = ClassObject[ClassMethod];
	  ClassObject[ClassMethod] = function() {
        var retvalue = ClassObject[method_id].apply(ClassObject, arguments);
        return HookMethod.call(HookClassObject, ClassObject, arguments, retvalue );
      }
	  return true;
    }
  }
  return false;
};

try {
	this.editor.implicitwait = new ImplicitWait(this.editor);
} catch (error) {
	alert('Error in ImplicitWait: ' + error);
}