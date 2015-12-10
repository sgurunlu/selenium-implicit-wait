This plugin allows Selenium IDE to automatically wait until the element is found before executing each command using a locator.<br>
It is designed to :<br>
<ul><li>Avoid the user to add waitForElementPresent before click, type, select...<br>
</li><li>Implement the implicit wait function available with Selenium 2 WebDrivers<br>
</li><li>Handle Ajax synchronisation issues</li></ul>

An hourglass button is added to SeleniumIDE to enable/disable the implicitWaitLocator function and also provides 2 new script commands.<br>
The first one is setImplicitWait which has the same purpose as the hourglass button and the second one is setImplicitWaitCondition which set a JavaScript condition that need to be true to execute each command.<br>
<br>
An error is raised when an element is not found once the timeout is reached.<br>
<br>
<h4>Release status</h4>
<ul><li>Beta. Feel free to report defects or wanted feature : <a href='http://code.google.com/p/selenium-implicit-wait/issues/list'>http://code.google.com/p/selenium-implicit-wait/issues/list</a></li></ul>

<h4>Minimum Requirements </h4>
<ul><li>Firefox 8<br>
</li><li>Selenium IDE 1.1.0 <a href='http://seleniumhq.org/download/'>http://seleniumhq.org/download/</a></li></ul>

<h4>How to use in SeleniumIDE ? </h4>
<ul><li>Download and install the plugin with Firefox (Download link is on the left)<br>
</li><li>Restart Firefox<br>
</li><li>Launch Selenium IDE<br>
</li><li>Open or record a script<br>
</li><li>Click on the hourglass button to activate the implicit wait function<br>
</li><li>Run the script and enjoy!</li></ul>

<h4>Screen Capture </h4>
<blockquote><img src='http://selenium-implicit-wait.googlecode.com/svn/wiki/screen-capture-01.png' /></blockquote>

<h4>New Selenium commands</h4>
<ul><li>setImplicitWait | timeout<br>
</li></ul><blockquote>Waits until a locator is found before executing the next command.<br>
Ex: setImplicitWait | 5000</blockquote>

<ul><li>setImplicitWaitCondition | timeout | condition_js<br>
</li></ul><blockquote>Waits until the condition is true before executing the next command.<br>
Examples using Ajax libraries to wait the end of a transaction :<br>
<pre><code> setImplicitWaitCondition | 5000 | !window.dojo || !window.dojo.io.XMLHTTPTransport.inFlight.length<br>
 setImplicitWaitCondition | 5000 | !window.Ajax || !window.Ajax.activeRequestCount<br>
 setImplicitWaitCondition | 5000 | !window.tapestry || !window.tapestry.isServingRequests()<br>
 setImplicitWaitCondition | 5000 | !window.jQuery || !window.jQuery.active<br>
 setImplicitWaitCondition | 5000 | !window.Sys || !window.Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack()<br>
 setImplicitWaitCondition | 5000 | !window.goog || !window.goog.net || !window.goog.net.XhrIo || !window.goog.net.XhrIo.sendInstances_.length<br>
</code></pre></blockquote>

<h4>Release note </h4>
<ul><li>1.0.13 - Full code refactoring<br>
</li><li>1.0.10 - Added user-extensions for Selenium Server, separated locator and condition timeout<br>
</li><li>1.0.8 - Added setImplicitWaitLocator and setImplicitWaitCondition functions<br>
</li><li>1.0.7 - first release</li></ul>

<h4>Author</h4>
<blockquote>Florent BREHERET