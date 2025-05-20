import { Component, OnInit } from '@angular/core';
import { AuthData } from '../../../auth/auth.model';
import { AppComponent } from '../../../app.component';
import { HttpService } from '../../../shared/http-service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../shared/app.service';
import { Util } from '../../Services/util.service';
import { APIURLS } from '../../../shared/api-url';
import { FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-approval-delegation',
  templateUrl: './approval-delegation.component.html',
  styleUrls: ['./approval-delegation.component.css'],
  providers: [Util]
})
export class ApprovalDelegationComponent implements OnInit {
  currentUser: AuthData;
  employeeId: any;
  urlPath: string = '';
  isLoading: boolean = false;
  delegationsList: any[] = [];
  details: any = {};
  action = "add";

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private util: Util, 
    private route: ActivatedRoute, private location: Location) {
  }

  ngOnInit() {

    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.employeeId = this.currentUser.uid;
      this.GetDelegationDetails();
    }
  }

  GetDelegationDetails() {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.APPROVAL_DELEGATION_GET_LIST_BY_EMP_ID + "/" + this.employeeId).then((data: any) => {
      if (data) {
        this.delegationsList = data;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      toastr.error(error);
    });
  }

  edit(id) {
    this.action = "edit";
    this.details = Object.assign({}, this.delegationsList.find(x => x.approvalDelegationId == id));
  }

  delete(id) {
    if (confirm("Are you sure you want to delete this?")) {
      this.httpService.HRdelete(APIURLS.APPROVAL_DELEGATION_API, id)
        .then(
          (data: any) => {
            this.isLoading = false;
            if (data == 200 || data.success) {
              this.action = "add";
              this.details = {};
              toastr.success('Deleted successfully!');
              this.GetDelegationDetails();
            }
            else
              toastr.error(data.message);
          },
          (err) => {
            this.isLoading = false;
            toastr.error('Error occured while deleting details. Error:' + err);
          })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while deleting details. Error:' + error);
        });
    }
  }

  submit() {
    let connection: any;

    this.isLoading = true;
    this.details.employeeId = this.employeeId;
    this.details.fromDate = this.util.getFormatedDateTime(this.details.fromDate);
    this.details.toDate = this.util.getFormatedDateTime(this.details.toDate);
    //this.details.createdDate = this.util.getFormatedDateTime(this.details.createdDate);    
    this.details.delegatedToId = $("#delegatedToId").val();
    connection = this.httpService.HRpost(APIURLS.APPROVAL_DELEGATION_SAVE_DETAILS, this.details);
    connection.then(
      (data: any) => {
        this.isLoading = false;
        if (data == 200 || data.success) {
          toastr.success('Saved successfully!');
          this.action = "add";
          this.details = {};
          this.GetDelegationDetails();
        }
        else
          toastr.error(data.message);
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving details. Error:' + error);
      });
  }

  cancel() {
    this.action = "add";
    this.details = {};
  }

  lastKeydown = 0;
  getDelegateToEmployees($event) {
    let text = $('#delegatedToName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastKeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              if (item.fullName != null)
                return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#delegatedToName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#delegatedToId").val(ui.item.value);
                  $("#delegatedToName").val(ui.item.label);
                }
                else {
                  $("#delegatedToId").val('');
                  $("#delegatedToName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#delegatedToId").val(ui.item.value);
                  $("#delegatedToName").val(ui.item.label);
                }
                else {
                  $("#delegatedToId").val('');
                  $("#delegatedToName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastKeydown = $event.timeStamp;
    }
  }

}
