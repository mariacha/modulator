modulator
=========

HTML 5 and Jquery to make an html page editable

Moving forward, it is important to know that there are three sections in the Modulator: The Inbox, the File Cabinet, and the Desktop.

In order to use the Modulator, you must first indicate whether you'd like to load an existing work area (an html file hosted on the internet) or to create one from scratch.


a) Create a work area - From a url
----------------------------------------
If you select this option, you will be asked to provide a url to the file containing modules. This is an html file that has been marked up in a specific way. See "c) How to mark up an HTML file for module use" below.

Once you've submitted a url to load into the Desktop, the Desktop will load the content of the file. If no <module> tags are found in the requested file, the Modulator will assume that you want to treat the entire file as a module. It will create a folder in the File Cabinet and load the entire contents into the Desktop with a predefined work area with a white background and a width of 600px. In general, this is less ideal than simply creating your own work area and dragging and dropping html files into the Inbox (see "b) Create a work area - Create your own").

If the Modulator does find <module> tags in your requested URL, each module will be added to the File Cabinet AND to the Desktop. You can then rearrange, edit, and delete modules from the Desktop as you wish. You can also edit other text, things like headers and footers, which are not modules and thus can not be rearranged. You can also proceed to drag and drop individual module files into the Inbox, as described in section "b) Create a work area - Create your own."

b) Create a work area - Create your own
----------------------------------------
If you choose to create your own work area within the Desktop, you will be asked to specify a width for the table that will contain your main modules, as well as a background color. Then you will be ready to add new modules to the desktop.

1) Drag any html files into the Inbox section of the screen.
2) The File Cabinet below should now be populated with Modules. These can be rearranged at will.

3) Files can then be dragged onto the Desktop to be edited. You can drag and drop as many Modules as you'd like onto the desktop, and the same Module can be dropped onto the desktop multiple times.

c) Editing modules on the desktop:
----------------------------------------
Modules on the desktop can be:

-Rearranged

Modules can be rearranged by selecting any non-editable part of the Module and dragging it between any other Modules on the desktop.

-Edited (text and images)

Text in the Modules can be edited by clicking on it and typing.

Images can be edited by clicking on the image. This click should bring up a form to edit the image's source (src). If you change the value in the "src" input and hit "Update." If the image fails to load, the form will highlight the bad source with red text and the image will not be changed.

-Deleted

To remove a module, click the X at the top right of the label that appears when you hover on the Module.

-Exported as HTML

To export the contents of your desktop, click the "View code" tab at the top right. This will populate a textarea with the value of the HTML as it displays on the "Edit HTML" tab.

d) How to mark up an HTML file for module use
----------------------------------------
Any part of code that you'd like to be sortable should be surrounded by a <module> tag in the following format:
<module name="Module name" class="main" >
<!-- content of the module here -->
</module>

All modules should have the following attributes:

-name: This is the text that will represent the module in the File Cabinet and on hover in the Desk Top. Two modules with the same name will be treated as the same module, and only the last module will show up.
-class: for now, this should be "main" only, but in the future we might use class to allow for things like interchangeable buttons.

When code is exported from the Modulator, all references to <module> tags are removed, so they should never appear in the final emails.

Note: All modules with the class of "main" should appear within the same parent element. It is not currently possible to rearrange modules between parent elements.