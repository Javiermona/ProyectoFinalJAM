sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";
//Menu //
        return Controller.extend("proyectofinal.controller.Menu", {
            onInit: function () {

            },
//
            navToCrearEmployee : function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//voy a la pantalla  crear empleado
			oRouter.navTo("CrearEmpleado",{},false);

            },

            navToVerEmployee : function(){
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("VerEmpleados",{},false);


            }

        });
    });
