sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter", 
    "sap/ui/model/FilterOperator" 

], function (Controller,History, Filter,FilterOperator) {
	"use strict";
	// //
    function onInit(){
        this._bus = sap.ui.getCore().getEventBus();
		this._splitAppEmployee = this.byId("splitAppEmployee");
	}
	
	//Función al seleccionar un empleado ..
	function onSelectEmployee(oEvent){
		//Se navega al detalle del empleado
		this._splitAppEmployee.to(this.createId("detailEmployee"));
		var context = oEvent.getParameter("listItem").getBindingContext("odataModel");
		//Se almacena el usuario seleccionado
		this.employeeId = context.getProperty("EmployeeId");
		var detailEmployee = this.byId("detailEmployee");
		//Se bindea a la vista con la entidad Users y las claves del id del empleado y el id del alumno
		detailEmployee.bindElement("odataModel>/Users(EmployeeId='"+ this.employeeId +"',SapId='"+this.getOwnerComponent().SapId+"')");
		
	}
	
	
	//Función para filtrar empleados
	function onSearchEmpleado(oEvent){
             let filters = [];
               let sQuery = oEvent.getSource().getValue();        
           
               var filter = new Filter({
                   filters: [
                       new Filter({
                           path:'SapId',
                           operator:'EQ',
                           value1:this.getOwnerComponent().SapId
                       }),
                       new Filter({
                           path: 'FirstName',
                           operator: FilterOperator.Contains,
                           value1: sQuery
                       })
                   ], and: true
               })
               filters.push(filter);
               var oList = this.byId("List");
               var oBinding = oList.getBinding("items");
               oBinding.filter(filters, "Application");        
	}
	

	//Función para eliminar el empleado seleccionado
	function onDeleteEmployee(oEvent){
		//Se muestra un mensaje de confirmación
		sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("estaSeguroEliminar"),{
			title : this.getView().getModel("i18n").getResourceBundle().getText("confirm"),
			onClose : function(oAction){
			    	if(oAction === "OK"){
			    		//Se llama a la función remove
						this.getView().getModel("odataModel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='"+this.getOwnerComponent().SapId+"')",{
							success : function(data){
								sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("seHaEliminadoUsuario"));
								//En el detalle se muestra el mensaje "Seleecione empleado"
								this._splitAppEmployee.to(this.createId("detailSelectEmployee"));
							}.bind(this),
							error : function(e){
								sap.base.Log.info(e);
							}.bind(this)
						});
			    	}
			}.bind(this)
		});
	}
	
	//Función para ascender a un empleado
	function onRiseEmployee(oEvent){
		if(!this.riseDialog){
            //this.riseDialog = sap.ui.xmlfragment("logaligroup/rrhh/fragment/RiseEmployee", this);
			this.riseDialog = sap.ui.xmlfragment("proyectofinal/fragment/RiseEmployee", this);
			this.getView().addDependent(this.riseDialog);
		}
		this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}),"newRise");
		this.riseDialog.open();
	}
	
	//Función para cerrar el dialogo
	function onCloseRiseDialog(){
		this.riseDialog.close();
	}
	
	//Función para crear un nuevo ascenso
	function addRise(oEvent){
		//Se obtiene el modelo newRise
		var newRise = this.riseDialog.getModel("newRise");
		//Se obtiene los datos
		var odata = newRise.getData();
		//Se prepara la informacion para enviar a sap y se agrega el campo sapId con el id del alumno y el id del empleado
		var body = {
			Amount : odata.Amount,
			CreationDate : odata.CreationDate,
			Comments : odata.Comments,
			SapId : this.getOwnerComponent().SapId,
			EmployeeId : this.employeeId
		};
		this.getView().setBusy(true);
		this.getView().getModel("odataModel").create("/Salaries",body,{
			success : function(){
				this.getView().setBusy(false);
				sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrectamente"));
				this.onCloseRiseDialog();
			}.bind(this),
			error : function(){
                this.getView().setBusy(false);
                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoErroneo"));
			}.bind(this)
		});
		
    }
    
    //Función que se ejecuta al cargar un fichero en el uploadCollection
	//Se agrega el parametro de cabecera x-csrf-token con el valor del token del modelo
	//Es necesario para validarse contra sap
	function onChange (oEvent) {
	   var oUploadCollection = oEvent.getSource();
	   // Header Token
	   var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
	    name: "x-csrf-token",
	    value: this.getView().getModel("odataModel").getSecurityToken()
	   });
	   oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
	 }
	 
	//Función que se ejecuta por cada fichero que se va a subir a sap
	//Se debe agregar el parametro de cabecera "slug" con el valor "id de sap del alumno",id del nuevo usuario y nombre del fichero, separados por ;
	 function onBeforeUploadStart (oEvent) {
	   var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: this.getOwnerComponent().SapId+";"+this.employeeId+";"+oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
      }
    
      function onUploadComplete (oEvent) {
        var oUploadCollection = oEvent.getSource();
        oUploadCollection.getBinding("items").refresh();
    }

    	//Función al pulsar "<" para regresar al menú
	function onBack(){
        // vamos al menu
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("Routemenu", {}, true);
}

    function onFileDeleted(oEvent){
        var oUploadCollection = oEvent.getSource();
        var sPath = oEvent.getParameter("item").getBindingContext("odataModel").getPath();
        this.getView().getModel("odataModel").remove(sPath, {
            success: function(){
                oUploadCollection.getBinding("items").refresh();
            },
            error: function(){

            }
        });
    }

    function downloadFile(oEvent){
        var sPath = oEvent.getSource().getBindingContext("odataModel").getPath();
        window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV"+sPath+"/$value");
    }

 


	return Controller.extend("proyectofinal.controller.VerEmpleados", {
		onInit: onInit,
		onBack: onBack,
		onSearchEmpleado : onSearchEmpleado,
		onSelectEmployee : onSelectEmployee,
		onDeleteEmployee : onDeleteEmployee,
		onRiseEmployee   : onRiseEmployee,
		onCloseRiseDialog : onCloseRiseDialog,
        addRise : addRise,
        onChange : onChange,
        onBeforeUploadStart : onBeforeUploadStart,
        onUploadComplete : onUploadComplete,
        onFileDeleted : onFileDeleted,
        downloadFile  : downloadFile
	});

}); 