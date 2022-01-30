/*global QUnit*/

sap.ui.define([
	"proyectofinal/controller/menu.controller"
], function (Controller) {
	"use strict";

	QUnit.module("menu Controller");

	QUnit.test("I should test the menu controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
