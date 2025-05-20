import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Termination } from '../termination/termination.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { CompleteTerminationTaskRequest } from '../pending-termination-list/completeTerminationTaskRequest.model';
import { PendingTaskModel } from '../pending-termination-list/pendingTaskModel.model';
import { Util } from '../../Services/util.service';
declare var $: any;
declare var toastr: any;
declare var require: any;

@Component({
  selector: 'app-view-pending-termination',
  templateUrl: './view-pending-termination.component.html',
  styleUrls: ['./view-pending-termination.component.css'],
  providers: [Util]
})
export class ViewPendingTerminationComponent implements OnInit {
  currentUser: AuthData;
  terminationId: any;
  approverId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isVisible: boolean = true;
  isChecked: boolean = true;
  terminationStatus: any;
  //terminationDetails:any={}; //= {} as Termination;
  terminationDetails = {} as Termination;
  employeeDetails: any = {};
  TerminationDate: string;
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments", "history"];
  objectType: string = "Termination";
  fileList: any[] = [];
  taskId: number = 0;
  comments: string;
  reason: string = "";
  noticePeriod: string;
  files: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location,
    private util: Util) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.terminationId = this.route.snapshot.paramMap.get('id1')!;
      this.approverId = this.currentUser.uid;
      this.taskId = Number(this.route.snapshot.paramMap.get('id2')!);
      this.util.canApproveTask(this.taskId, this.currentUser.uid);
      this.GetTerminationDetailsById(this.terminationId);

    }
  }

  GetTerminationDetailsById(id) {
    this.isLoading = true;
    this.isVisible = true;

    this.httpService.HRget(APIURLS.TERMINATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
        this.terminationDetails = data;
        this.fileList = data.attachments;
        this.terminationId = this.terminationDetails.terminationId;
        this.employeeId = this.terminationDetails.employeeId;
        this.terminationStatus = this.terminationDetails.status;
        if (this.terminationStatus == "Pending For Approval") {
          this.TerminationDate = this.getDateFormate(this.terminationDetails.terminationDate);
          this.noticePeriod = this.terminationDetails.noticePeriod + ' Month(s)';
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.errMsg = error;
    });
  }

  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
    console.log(this.currentTab);
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

  }

  updateTerminationDetails() {
    let connection: any;
    let data: any;

      this.terminationDetails.modifiedById = this.currentUser.uid;
      this.terminationDetails.modifiedDate = new Date();

      this.isLoading = true;
      connection = this.httpService.HRpost(APIURLS.TERMINATION_UPDATE, this.terminationDetails);
      connection.then(
        (data: any) => {
          this.isLoading = false;
          if (data == 200 || data.success) {
            toastr.success('Details updated successfully!');
          }
          else
          toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
        },
        (err) => {
          this.isLoading = false;
          toastr.error('Error occured while editing termination details. Error:' + err);
        })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while editing termination details. Error:' + error);
        });
    
  }

  approve() {

    if (confirm("Are you sure you want to approve this?")) {
      this.updateTerminationDetails();

      var request = {} as CompleteTerminationTaskRequest;
      request.flowTaskId = this.taskId;
      request.completedById = this.currentUser.uid;
      toastr.info("Approving...");
      this.isLoading = true;
      this.httpService.HRpost(APIURLS.TERMINATION_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if (!data.success) {
            toastr.error(data.message);
          } else {
            toastr.success("Termination Approved successfully.");
            this.router.navigate(['/HR/termination/pending-termination-list']);
          }
        }
        this.isLoading = false;
      }).catch(error => {
        toastr.error("Error occured.");
        this.isLoading = false;
      });
    }
  }

  rejectTask() {
    if (this.reason==undefined || this.reason=='')
    {
      toastr.error("Enter Reason For Rejection in Comments.");
      return;
    }
   
    var request = {} as CompleteTerminationTaskRequest;
    request.flowTaskId = this.taskId;
    request.comments = this.reason;
    request.completedById = this.currentUser.uid;
    toastr.info("Rejecting...");
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.TERMINATION_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if (!data.success) {
          toastr.error(data.message);
        }
        else {
          toastr.success("Termination Rejected successfully.");
          this.router.navigate(['/HR/termination/pending-termination-list']);
        }
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error(error);
      this.isLoading = false;
    });
  }

  Back(){
    this.location.back();
  }
}
