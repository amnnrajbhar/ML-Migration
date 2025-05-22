import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { Util } from '../../Services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-resignation-checklist',
  templateUrl: './resignation-checklist.component.html',
  styleUrls: ['./resignation-checklist.component.css'],
  providers: [Util]
})
export class ResignationChecklistComponent implements OnInit {
  @ViewChild(NgForm  , { static: false }) checklistForm: NgForm;
  @Input() resignationId: number;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();
  @Input() actionAllowed: boolean = false;
  
  currentUser: AuthData;
  urlPath: string = '';
  isLoading = false;
  checklistItemList: any[] = [];
  item: any = {};
  departmentList: any[] = [];
  selectedDepartment: any;
  selectedSPOC: any;
  count =0;
  editIndex =0;
  isEdit = false;
  resignationDetails:any = {};
  errMsg: string = "";
   statusList = [
    { type: "Pending", color:"warning" },
    { type: "Completed", color:"success"},
    { type: "Not Applicable", color:"info" },    
    { type: "Cancelled", color:"danger" }    
  ]

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    console.log(this.editAllowed);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if(this.editAllowed)
      {
        this.getDepartments();
      }
      this.GetChecklistItems();
    }
  }

  SaveData(){
    let connection: any;
    this.isLoading = true;
    let data: any = {};
    data.resignationId = this.resignationId;
    data.list = this.checklistItemList;
    data.updatedById = this.currentUser.uid;    
    connection = this.httpService.HRpost(APIURLS.RESIGNATION_SAVE_CHECKLIST_ITEMS, data);
    
    toastr.info('Updating checklist changes...');

    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Checklist details updated successfully!');

        }
        else
        toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while updating checklist details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving checklist details. Error:' + error);
      });
  }

  GetChecklistItems() {   

    if(this.resignationId && this.resignationId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.RESIGNATION_GET_CHECKLIST_ITEMS+"/"+ this.resignationId).then((data: any) => {
        if (data) {
          this.checklistItemList = data;       
          for(var item of this.checklistItemList){
            item.statusColor = this.statusList.find(x=>x.type == item.status).color;
          } 
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.errMsg = "Error occurred while fetching details, please check the link.";
      });
    }
  }

  getDepartments(){
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }

  onAddLineClick(){    
    if($("#spocEmployeeId").val() == "" || $("#spocEmployeeId").val() == null || $("#spocEmployeeId").val() == undefined){
      toastr.error("Please select a Department SPOC."); return;
    }
    this.item.departmentName = this.selectedDepartment.description;
    this.item.departmentId = this.selectedDepartment.id;
    this.item.spocEmployeeName = $("#spocEmployeeName").val();
    this.item.spocEmployeeId = $("#spocEmployeeId").val();
    this.checklistItemList.push(this.item);
    this.count++;
    this.clearInput();
  }
  
  EditLine(item, index){
    this.selectedDepartment = this.departmentList.find(x=>x.id==item.departmentId);
    this.item = Object.assign({}, item);
    this.isEdit = true;
    this.editIndex = index;
  }

  onUpdateClick(){
    this.item.departmentName = this.selectedDepartment.description;
    this.item.departmentId = this.selectedDepartment.id;
    this.item.spocEmployeeName = $("#spocEmployeeName").val();
    this.item.spocEmployeeId = $("#spocEmployeeId").val();
    this.checklistItemList[this.editIndex] = this.item;
    
    this.clearInput();
  }

  RemoveLine(no){
    if(no == this.editIndex && this.isEdit){
      this.clearInput();
    }else if(no < this.editIndex){
      this.editIndex--;
    }
    this.checklistItemList.splice(no,1);
    this.count--;
  }

  clearInput(){
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;    
    this.selectedDepartment = null;
    this.checklistForm.form.markAsPristine();
    this.checklistForm.form.markAsUntouched();
  }

  lastApprovingkeydown = 0;
  getSpocEmployeeName($event) {
    let text = $('#spocEmployeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApprovingkeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " ("+item.employeeId+")", value: item.id };
            })
            $('#spocEmployeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#spocEmployeeId").val(ui.item.value);
                  $("#spocEmployeeName").val(ui.item.label);
                }
                else{
                  $("#spocEmployeeId").val('');
                  $("#spocEmployeeName").val('');
                }                  
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#spocEmployeeId").val(ui.item.value);
                  $("#spocEmployeeName").val(ui.item.label);                  
                }
                else{
                  $("#spocEmployeeId").val('');
                  $("#spocEmployeeName").val('');                  
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApprovingkeydown = $event.timeStamp;
    }
  }

  checklistItemId: number;
  comments: string;
  action: string;

  complete(id){
    this.checklistItemId = id;
    this.comments = "";
    this.action = "Completed";
  }
  
  cancel(id){
    this.checklistItemId = id;
    this.comments = "";
    this.action = "Not Applicable";
  }

  UpdateChecklist() {

    if(this.action == "Not Applicable" && this.comments == ""){
      toastr.error("Please enter comments.");
      return;
    }

    $("#CommentsModal").modal('hide');
    var request:any = {};
    request.checklistItemId = this.checklistItemId;
    request.comments = this.comments;
    request.status = this.action;
    request.modifiedById = this.currentUser.uid;
    toastr.info("Updating...");
    this.httpService.HRpost(APIURLS.CHECKLIST_UPDATE_STATUS, request).then((data: any) => {
      if (data == 200 || data.success) {          
        this.GetChecklistItems();
        toastr.success("Successfully updated.");
      } else if (!data.success) {
        toastr.error(data.message);
      } else
      toastr.error("Error occurred.");
    }).catch(error => {
      toastr.error(error);
    });
  }

}
