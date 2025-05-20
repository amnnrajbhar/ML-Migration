import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';
import { Util } from '../../Services/util.service';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.css'],
  providers: [Util]
})
export class ApproveComponent implements OnInit {

  currentUser: AuthData;
  objectType: string = "Transfer";
  employeeId: any;
  transferId: any;
  isLoading: boolean = false;
  transferDetails: any = {};
  taskId: number = 0;
  comments: string;
  reason: string = "";
  approvalTypes =
    [
      { type: "HR" },
      { type: "HOD" },
      { type: "Reporting Manager and HOD" },
      { type: "Predefined Approvers" }
    ];
    jobChangeDetails: any[] = [];

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private fb: FormBuilder,
    private location: Location, private util: Util) {
  }

  ngOnInit() {
    this.transferId = this.route.snapshot.paramMap.get('id')!;
    this.taskId = Number(this.route.snapshot.paramMap.get('id2')!);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));  
    this.util.canApproveTask(this.taskId, this.currentUser.uid);
    this.getTransferDetails(this.transferId);
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

  }

  getTransferDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_TRANSFER_GET_DETAILS_BY_ID, id).then((data: any) => {
      if (data) {
        this.transferDetails = data;
        this.employeeId = data.employeeId;        
        this.jobChangeDetails = data.jobChangeDetailsList;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  
  goBack() {
    this.location.back();
  }

  
  approve() {

    if (confirm("Are you sure you want to approve this?")) {
      //this.updateTerminationDetails();

      var request: any = {};
      request.flowTaskId = this.taskId;
      request.comments = this.reason;
      request.completedById = this.currentUser.uid;
      toastr.info("Approving...");
      this.isLoading = true;
      this.httpService.HRpost(APIURLS.HR_TRANSFER_APPROVE_TASK, request).then((data: any) => {
        if (data) {
          if (!data.success) {
            toastr.error(data.message);
          } else {
            toastr.success("Transfer Approved successfully.");
            this.router.navigate(['/HR/transfer/pending-list']);
          }
        }
        this.isLoading = false;
      }).catch(error => {
        toastr.error("Error occured.");
        this.isLoading = false;
      });
    }
  }

  reject() {
    if (this.reason==undefined || this.reason=='')
    {
      toastr.error("Enter Reason For Rejection in comments.");
      return;
    }
    var request: any = {};
    request.flowTaskId = this.taskId;
    request.comments = this.reason;
    request.completedById = this.currentUser.uid;
    toastr.info("Rejecting...");
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_TRANSFER_REJECT_TASK, request).then((data: any) => {
      if (data) {
        if (!data.success) {
          toastr.error(data.message);
        }
        else {
          toastr.success("Transfer Rejected successfully.");
          this.router.navigate(['/HR/transfer/pending-list']);
        }
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error(error);
      this.isLoading = false;
    });
  }

}
