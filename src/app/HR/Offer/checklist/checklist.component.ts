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
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.css'],
  providers: [Util]
})
export class ChecklistComponent implements OnInit {
  @ViewChild(NgForm  , { static: false }) checklistForm: NgForm;
  @Input() offerId: number;
  @Input() editAllowed: boolean = true;
  @Output() dataSaved: EventEmitter<any> =   new EventEmitter();
  @Output() dataLoaded: EventEmitter<any> =   new EventEmitter();

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
  offerDetails:any = {};
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
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getDepartments();
      this.GetChecklistItems();
    }
  }

  SaveData(){
    let connection: any;
    //this.isLoading = true;
    let data: any = {};
    data.offerId = this.offerId;
    data.list = this.checklistItemList;
    data.updatedById = this.currentUser.uid;    
    connection = this.httpService.HRpost(APIURLS.OFFER_SAVE_CHECKLIST_ITEMS, data);
    
    toastr.info('Saving...');

    connection.then(
      (data: any) => {
        //this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          toastr.success('Details saved successfully!');
            this.dataSaved.emit(data);
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        //this.isLoading = false;
        toastr.error('Error occured while saving checklist details. Error:' + err);
      })
      .catch(error => {
        //this.isLoading = false;
        toastr.error('Error occured while saving checklist details. Error:' + error);
      });
  }

  GetChecklistItems() {   

    if(this.offerId && this.offerId > 0){
      this.isLoading = true;
      this.httpService.HRget(APIURLS.OFFER_GET_CHECKLIST_ITEMS+"/"+ this.offerId).then((data: any) => {
        if (data) {
          this.checklistItemList = data;       
          for(var item of this.checklistItemList){
            item.statusColor = this.statusList.find(x=>x.type == item.status).color;
            item.spocEmployeeName = item.spocEmployeeFirstName +' '+item.spocEmployeeMiddleName+' '+item.spocEmployeeLastName;
          } 
        }
        else
          this.errMsg = "Checklist config not found.";

        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        this.errMsg = "Error occurred while fetching details, please check the link.";
        this.offerDetails = {};
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
    if(!$("#spocEmployeeId").val() || $("#spocEmployeeId").val() <= 0){
      toastr.error("Please select a SPOC Employee.");
      return;
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
    if(!$("#spocEmployeeId").val() || $("#spocEmployeeId").val() <= 0){
      toastr.error("Please select a SPOC Employee.");
      return;
    }
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
              if(item.fullName != null)
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

}
