

  import { Component, OnInit, ViewChild } from '@angular/core';
  import { NgForm } from '@angular/forms';
  import { HttpService } from '../../../shared/http-service';
  import { APIURLS } from '../../../shared/api-url';
  import { Router, RouterModule } from '@angular/router';
  import { ExcelService } from '../../../shared/excel-service';
  import { AuthData } from '../../../auth/auth.model';
  import { Util } from '../../Services/util.service';
  import { MasterDataService } from '../../Services/masterdata.service';
  import swal from 'sweetalert';
  declare var $: any;
  declare var toastr: any;
  
  
@Component({
  selector: 'app-employee-rejoin-execption',
  templateUrl: './employee-rejoin-execption.component.html',
  styleUrls: ['./employee-rejoin-execption.component.css'],
  providers: [Util]
})

export class EmployeeRejoinExecptionComponent implements OnInit {
  @ViewChild(NgForm, { static: false }) detailsForm!: NgForm;

    isLoading: boolean = false;
    currentUser!: AuthData;
    filterModel: any = {};
    filterData: any = {}
    item: any = {};
    count: number = 0;
    isEdit: boolean = false;
    editIndex: number = -1;
    plantList: any[] = [];
    payGroupList: any[] = [];
    filterPayGroupList: any[] = [];
    payGroupFullList: any[] = [];
    employeeCategoryList: any[] = [];
    departmentList:any[]=[];
    constructor(private httpService: HttpService,
      private router: Router, private util: Util, private masterService: MasterDataService, private excelService: ExcelService) {
       }
  
    ngOnInit() {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.masterService.getPlantList().then((data:any)=>{this.plantList = data;});
      this.masterService.getPayGroupList().then((data:any)=>{this.payGroupFullList = data;});
      this.masterService.getEmployeeCategoryList().then((data:any)=>{this.employeeCategoryList = data;});
      this.masterService.getDepartments().then((data: any) => { this.departmentList = data; });

      this.filterModel.pageSize = 10;    
      this.filterModel.plantId = "";
      this.filterModel.payGroupId = "";
      this.filterModel.employeeCategoryId = "";
      this.filterModel.departmentId="";
      this.filterModel.name='';
      this.filterModel.createdBy="";
      this.filterModel.fromDate="";
      this.filterModel.toDate='';
      this.filterModel.active="";
      this.getListData();
    }
  
    getListData(){    
      this.filterModel.pageNo = 1;
      this.getData();
    }
  
    getData(){
      this.isLoading = true;    
      this.httpService.HRpost(APIURLS.HR_EMPLOYEE_REJOIN_EXECPTION_GET_BY_FILTER, this.filterModel).then((data: any) => {
        this.filterData = data;      
        this.isLoading = false;
      }).catch((error)=> {
        toastr.error("Error while fetching the list. Error: "+ error);
        this.isLoading = false;      
      });
    }
  
    
    gotoPage(no){
      if( this.filterModel.pageNo == no) return;
      this.filterModel.pageNo = no;
      this.getData();    
    }
  
    pageSizeChange(){
      this.filterModel.pageNo = 1;    
      this.getData();    
    }
  lastEmployeekeydown = 0;

    getEmployeesList($event) {
      let text = $('#employeeName').val();
  
      if (text.length > 3) {
        if ($event.timeStamp - this.lastEmployeekeydown > 400) {
          this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_EXITED_LIST + "/" + text).then((data: any) => {
            if (data.length > 0) {
              var sortedList = data.sort((a:any, b:any) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
              var list = $.map(sortedList, function (item) {
                return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
              })
              $('#employeeName').autocomplete({
                source: list,
                classes: {
                  "ui-autocomplete": "highlight",
                  "ui-menu-item": "list-group-item"
                },
                change: function (event:any, ui:any) {
                  if (ui.item) {
                    $("#employeeId").val(ui.item.value);
                    $("#employeeName").val(ui.item.label);
                  }
                  else {
                    $("#employeeId").val('');
                    $("#employeeName").val('');
                  }
                },
                select: function (event:any, ui:any) {
                  if (ui.item) {
                    $("#employeeId").val(ui.item.value);
                    $("#employeeName").val(ui.item.label);
                  }
                  else {
                    $("#employeeId").val('');
                    $("#employeeName").val('');
                  }
                  return false;
                }
              });
            }
          });
        }
        this.lastEmployeekeydown = $event.timeStamp;
      }
    }
    
    addData(){
      
      toastr.info("Adding...");
      this.isLoading = true;    
      this.item.createdById = this.currentUser.uid;
      this.item.employeeId = $("#employeeId").val();
        
      this.httpService.HRpost(APIURLS.HR_EMPLOYEE_REJOIN_EXECPTION_ADD, this.item)
      .then((data: any) => {
        if (data == 200 || data.employeeRejoiningExceptionId> 0) {
          this.item.employeeRejoiningExceptionId = data.employeeRejoiningExceptionId;
          this.onAddLine();
          toastr.success("Successfully added the details.");        
          $("#detailsModal").modal("hide");
          this.getData();    
        }
        else
          toastr.error(data.message);
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        toastr.error('Error adding details...'+ error);
      })
    }
  
    updateData(){
            
      toastr.info("Updating...");
      this.isLoading = true;
      this.item.employeeId = $("#employeeId").val();
      this.item.modifiedById = this.currentUser.uid;
      this.item.modifiedDate = this.util.getFormatedDateTime(new Date());
  
      this.httpService.HRput(APIURLS.HR_EMPLOYEE_REJOIN_EXECPTION_API, this.item.employeeRejoiningExceptionId , this.item)
      .then((data: any) => {
        if (data == 200 || data.id > 0) {          
          this.onUpdateLine();
          toastr.success("Successfully updated the details.");
          $("#detailsModal").modal("hide");
          this.getData();    
        }
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        toastr.error('Error updating details...'+ error);
      })
    }
  
    deleteData(id, no){
      if(id <= 0) return;
      if(!confirm("Are you sure you want to delete this record?")) return;
  
      toastr.info('Deleting...');
      this.isLoading = true;
      this.httpService.HRdelete(APIURLS.HR_EMPLOYEE_REJOIN_EXECPTION_API, id)
      .then(
        (data: any) => {
          this.isLoading = false;       
          if (data == 200 || data.success) 
          {   
            toastr.success('Deleted successfully!');
            this.RemoveLine(no);
            this.getData();    
          }
          else
          toastr.error(data.message);
        },
        (err) => {
          this.isLoading = false;
          toastr.error('Error occured while deleting the details. Error:' + err);
        })
        .catch((error)=> {
          this.isLoading = false;
          toastr.error('Error occured while deleting the details. Error:' + error);
        });
    }
  
    onAddClick(){
      this.clearInput();
      $("#detailsModal").modal("show");
    }
  
    onAddLine(){
      this.filterData.list.push(this.item);
      this.count++;
      this.clearInput();
    }
    
    EditLine(item, index){    
      this.item = Object.assign({}, item);
      $("#employeeId").val(this.item.employeeId);
      this.item.employeeName = this.item.employeeName+ " ("+this.item.employeeNo+")";
      this.isEdit = true;
      this.editIndex = index;
      $("#detailsModal").modal("show");
    }
  
    onUpdateLine(){    
      this.filterData.list[this.editIndex] = this.item;    
      this.clearInput();
    }
  
    RemoveLine(no){
      if(no == this.editIndex && this.isEdit){
        this.clearInput();
      }else if(no < this.editIndex){
        this.editIndex--;
      }
      this.filterData.list.splice(no,1);
      this.count--;
    }
  
    clearInput(){
      this.isEdit = false;
      this.item = {};
      this.editIndex = -1;    
      this.detailsForm.form.markAsPristine();
      this.detailsForm.form.markAsUntouched();
    }

    exportData() {
      this.filterModel.export = true;
      this.isLoading = true;
      this.httpService.HRpost(APIURLS.HR_EMPLOYEE_REJOIN_EXECPTION_GET_BY_FILTER, this.filterModel).then((data: any) => {
        this.filterModel.export = false;
        var exportList = [];
        let index = 0;
        data.list.forEach((item :any) => {
          index = index + 1;
          let exportItem = {
            
            "Plant":item.plantName,
            "Pay Group":item.payGroupName,
            "Employee Category":item.employeeCategoryName,
            //"After Days":
            "Created By":item.createdByName,
            "Created On":item.createdDate ,
            "Employee Name":item.employeeNo,
            "Employee No":item.employeeName ,
            "Employee Type":item.employeeType,
            "Designation":item.designation,
            "Role":item.role,
            "Reporting Manager":item.reportingManager
          };
          exportList.push(exportItem);
        });
        this.excelService.exportAsExcelFile(exportList, 'SalaryHead_List');
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
        this.filterModel.export = false;
        swal('Error occurred while fetching data.');
        return;
      });
    }
  
    onPlantChange(){
      if(this.filterModel.plantId > 0){
        let plant = this.plantList.find(x=>x.id == this.filterModel.plantId)
        this.filterPayGroupList = this.payGroupFullList.filter((x:any)=>x.plant == plant.code);
      }
      else
        this.filterPayGroupList = [];
    }

  }
  