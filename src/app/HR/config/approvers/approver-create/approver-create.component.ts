import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../../shared/api-url';
import { HttpService } from '../../../../shared/http-service';
import { AppService } from '../../../../shared/app.service';
import { AppComponent } from '../../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../../auth/auth.model';
import { ExcelService } from '../../../../shared/excel-service';
import swal from 'sweetalert';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-approver-create',
  templateUrl: './approver-create.component.html',
  styleUrls: ['./approver-create.component.css']
})
export class ApproverCreateComponent implements OnInit {

  approver = {} as any;
  isLoading: boolean = false;
  currentUser: AuthData;
  approverTypes = [{ type: "Appraisal" }, { type: "Confirmation" }, { type: "Resignation" }, { type: "Transfer" }];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private excelService: ExcelService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isLoading = true;
    this.getAllDropDownValues();
    this.isLoading = false;
  }

  getAllDropDownValues() {
    this.getDepartments();
    this.getState();
    this.getPlantList();
  }

  plantList: any[] = [];
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  payGroupList: any[] = [];
  getPayGroupList() {
    this.employeeCategoryList = [];
    if (this.approver.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.approver.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  employeeCategoryList: any[] = [];
  getEmployeeCategoryList() {
    if (this.approver.plantId > 0 && this.approver.payGroupId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/" + this.approver.plantId + "/" + this.approver.payGroupId)
        .then((data: any) => {
          if (data.length > 0) {
            this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
          }
        }).catch(error => {
          this.employeeCategoryList = [];
        });
    }
    else
      this.employeeCategoryList = [];
  }

  departmentList: any[] = [];
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }

  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a, b) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch(error => {
      this.stateList = [];
    });
  }

  lastApproverEmployeekeydown = 0;
  getEmployeesList($event) {
    let text = $('#employeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApproverEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#employeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else {
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }
              },
              select: function (event, ui) {
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
      this.lastApproverEmployeekeydown = $event.timeStamp;
    }
  }

  submit() {
    let connection: any;
    var today = new Date();
   if(this.approver.stateId != null && this.approver.departmentId != null)
   {
     toastr.error("Either of State or Department should be selected");
     return;
   }
    this.isLoading = true;
    this.approver.employeeId = $("#employeeId").val();
    this.approver.createdById = this.currentUser.uid;
    this.approver.modifiedById = this.currentUser.uid;
 
    connection = this.httpService.HRpost(APIURLS.HR_ADD_APPROVER_CONFIG, this.approver);

    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          toastr.success("Details saved successfully.");
        }
        else
          toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving Details');
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving Details');
      });
  }

}
