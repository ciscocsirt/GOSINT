/*! CellEdit 1.0.19
* ©2016 Elliott Beaty - datatables.net/license
*/

/**
* @summary CellEdit
* @description Make a cell editable when clicked upon
* @version 1.0.19
* @file dataTables.editCell.js
* @author Elliott Beaty
* @contact elliott@elliottbeaty.com
* @copyright Copyright 2016 Elliott Beaty
*
* This source file is free software, available under the following license:
* MIT license - http://datatables.net/license/mit
*
* This source file is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
* or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
*
* For details please refer to: http://www.datatables.net
*/
function getInputHtml(a,b,c){var d,e,f,g,h,i;switch(f={focus:!0,html:null},b.inputTypes&&$.each(b.inputTypes,function(b,c){c.column==a&&(d=c,e=d.type.toLowerCase())}),b.inputCss&&(g=b.inputCss),b.confirmationButton&&(h=b.confirmationButton.confirmCss,i=b.confirmationButton.cancelCss,e+="-confirm"),e){case"list":f.html="<select class='"+g+"' onchange='$(this).updateEditableCell(this);'>",$.each(d.options,function(a,b){f.html=f.html+"<option value='"+b.value+"' >"+b.display+"</option>"}),f.html=f.html+"</select>",f.focus=!1;break;case"list-confirm":f.html="<select class='"+g+"'>",$.each(d.options,function(a,b){f.html=f.html+"<option value='"+b.value+"' >"+b.display+"</option>"}),f.html=f.html+"</select>&nbsp;<a href='#/' class='"+h+"' onclick='$(this).updateEditableCell(this);'>Confirm</a> <a href='#/' class='"+i+"' onclick='$(this).cancelEditableCell(this)'>Cancel</a> ",f.focus=!1;break;case"datepicker":case"datepicker-confirm":if(void 0===jQuery.ui){alert("jQuery UI is required for the DatePicker control but it is not loaded on the page!");break}jQuery(".datepick").datepicker("destroy"),f.html="<input id='ejbeatycelledit' type='text' name='date' class='datepick "+g+"'   value='"+c+"'></input> &nbsp;<a href='#/' class='"+h+"' onclick='$(this).updateEditableCell(this)'>Confirm</a> <a href='#/' class='"+i+"' onclick='$(this).cancelEditableCell(this)'>Cancel</a>",setTimeout(function(){var a="http://jqueryui.com/resources/demos/datepicker/images/calendar.gif";void 0!==d.options&&void 0!==d.options.icon&&(a=d.options.icon);jQuery(".datepick").datepicker({showOn:"button",buttonImage:a,buttonImageOnly:!0,buttonText:"Select date"})},100);break;case"text-confirm":case"undefined-confirm":f.html="<input id='ejbeatycelledit' class='"+g+"' value='"+c+"'></input>&nbsp;<a href='#/' class='"+h+"' onclick='$(this).updateEditableCell(this)'>Confirm</a> <a href='#/' class='"+i+"' onclick='$(this).cancelEditableCell(this)'>Cancel</a> ";break;default:f.html="<input id='ejbeatycelledit' class='"+g+"' onfocusout='$(this).updateEditableCell(this)' value='"+c+"'></input>"}return f}function getInputField(a){var b;switch($(a).prop("nodeName").toLowerCase()){case"a":$(a).siblings("input").length>0&&(b=$(a).siblings("input")),$(a).siblings("select").length>0&&(b=$(a).siblings("select"));break;default:b=$(a)}return b}function sanitizeCellValue(a){return void 0===a||null===a||a.length<1?"":(isNaN(a)&&(a=a.replace(/'/g,"&#39;")),a)}jQuery.extend(jQuery.fn.dataTableExt.oSort,{"moment-js-date-pre":function(a){return moment(a,"ddd DD MMM YYYY HH:mm:ss UTC").unix()},"moment-js-date-asc":function(a,b){return a-b},"moment-js-date-desc":function(a,b){return b-a}}),jQuery.fn.dataTable.Api.register("MakeCellsEditable()",function(a){var b=this.table();jQuery.fn.extend({updateEditableCell:function(b){function i(){a.allowNulls.errorClass?$(g).addClass(a.allowNulls.errorClass):$(g).css({border:"red solid 1px"})}function j(b){var c=e.data();e.data(b),a.onUpdate(e,d,c)}var c=$(b.closest("table")).DataTable().table(),d=c.row($(b).parents("tr")),e=c.cell($(b).parent()),f=e.index().column,g=getInputField(b),h=g.val();!h&&a.allowNulls&&1!=a.allowNulls?a.allowNulls.columns?a.allowNulls.columns.indexOf(f)>-1?j(h):i():h||i():j(h);var k=c.page.info().page;c.page(k).draw(!1)},cancelEditableCell:function(a){var b=$(a.closest("table")).DataTable().table(),c=b.cell($(a).parent());c.data(c.data()),b.draw()}}),"destroy"===a&&($(b.body()).off("click","td"),b=null),null!=b&&$(b.body()).on("click","td",function(){var c=b.cell(this).index().column;if(a.columns&&a.columns.indexOf(c)>-1||!a.columns){var d=b.row($(this).parents("tr"));editableCellsRow=d;var e=b.cell(this).node(),f=b.cell(this).data();if(f=sanitizeCellValue(f),!$(e).find("input").length&&!$(e).find("select").length){var g=getInputHtml(c,a,f);$(e).html(g.html),g.focus&&$("#ejbeatycelledit").focus()}}})});
