/*
 * Copyright 2012 Florent Breheret
 * http://code.google.com/p/selenium-implicit-wait/
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
function ImplicitWait(editor) {
	var self=this;
	this.editor = editor;
	this.buttonHouglassChecked = false;
	this.isImplicitWaitLocatorActivated = false;
	this.isImplicitWaitAjaxActivated = false;
	this.implicitAjaxWait_Condition=null;
	this.implicitAjaxWait_Function=function(){ return true;};
	this.locatorTimeout=0;
	this.conditionTimeout=0;
	this.isLogEnabled=true;
	editor.app.addObserver({
		testSuiteChanged: function(testSuite) {
			if (!self.editor.selDebugger.isHooked) {
				self.editor.selDebugger.isHooked = self.HookAnObjectMethodAfter(self.editor.selDebugger, 'init', self, self.editor_selDebugger_init_hooked);
			}
		}
	});
	self.HookAnObjectMethodBefore(Editor.controller, 'doCommand', self, self.Editor_controller_doCommand_hooked);
}

ImplicitWait.prototype.Editor_controller_doCommand_hooked = function( object, arguments ) {
	switch (arguments[0]) {
		case "cmd_selenium_play":
		case "cmd_selenium_play_suite":
		case "cmd_selenium_reload":
			this.locatorTimeout=this.editor.getOptions().timeout;
			this.isImplicitWaitLocatorActivated = this.buttonHouglassChecked;
			this.isImplicitWaitAjaxActivated = false;
		break;
	}
	return true;
};

ImplicitWait.prototype.editor_selDebugger_init_hooked = function( object, arguments, retvalue  ) {
	object.runner.LOG.debug('Implicit wait installation');
	object.runner.IDETestLoop.prototype.resume = Function_Override_TestLoop_resume;
	object.runner.PageBot.prototype.findElement = Function_Override_BrowserBot_findElement;
	this.HookAnObjectMethodBefore(object.runner.LOG, 'log', this, function(){return this.isLogEnabled} );
};

ImplicitWait.prototype.toggleImplicitWaitButton = function(button) {
	button.checked = !button.checked;
	this.buttonHouglassChecked = button.checked;
	this.isImplicitWaitLocatorActivated = this.buttonHouglassChecked;
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
		if (editor.implicitwait.isImplicitWaitAjaxActivated && !this.currentCommand.implicitElementWait_EndTime) {
			if( !this.currentCommand.implicitAjaxWait_EndTime ){
					this.currentCommand.implicitAjaxWait_EndTime = ( new Date().getTime() + parseInt(editor.implicitwait.conditionTimeout * 0.8) ) ;
					return window.setTimeout( function(){return self.resume.apply(self);}, 3);
			}
			if (new Date().getTime() > this.currentCommand.implicitAjaxWait_EndTime) {
				throw new SeleniumError("Implicit wait timeout reached while waiting for condition \"" + editor.implicitwait.implicitAjaxWait_Condition  + "\"");
			}else{
				try{
					ret = editor.implicitwait.implicitAjaxWait_Function.call(editor.selDebugger.runner.selenium);
					//ret=eval(editor.implicitwait.implicitAjaxWait_Condition);
					//ret=(function(condition){return eval(condition);}).call(editor.selDebugger.runner.selenium, editor.implicitwait.implicitAjaxWait_Condition)
				} catch (e) {
					throw new SeleniumError("ImplicitWaitCondition failed : " + e.message );
				}
				if(!ret) return window.setTimeout( function(){return self.resume.apply(self);}, 20);
			}
		}
		if(editor.implicitwait.isImplicitWaitLocatorActivated){
			if(!this.currentCommand.implicitElementWait_EndTime){
				this.currentCommand.implicitElementWait_EndTime = ( new Date().getTime() + parseInt(editor.implicitwait.locatorTimeout * 0.8) ) ;
			}
		}
		editor.selDebugger.runner.selenium.browserbot.runScheduledPollers();
		this._executeCurrentCommand();
		this.continueTestWhenConditionIsTrue();
	} catch (e) {
		if(e.isFindElementError){
			if(editor.implicitwait.isImplicitWaitLocatorActivated){
				if( new Date().getTime() < this.currentCommand.implicitElementWait_EndTime){
					editor.implicitwait.isLogEnabled = false;
					return window.setTimeout( function(){return self.resume.apply(self);}, 20);
				}else{
					e = SeleniumError( "Implicit wait timeout reached. " + e.message );
				}
			}else{
				e = SeleniumError( e.message );
			}
		}
		editor.implicitwait.isLogEnabled = true;
		if(!this._handleCommandError(e)){
			this.testComplete();
		}else {
			this.continueTest();
		}
	}
	editor.implicitwait.isLogEnabled = true;
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