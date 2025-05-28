import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { CompleteTaskRequest } from '../../pending-tasks/completeTaskRequest.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-transfer-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  providers:[Util]
})
export class ViewComponent implements OnInit {

  currentUser!: AuthData;
  objectType: string = "Transfer";
  employeeId: any;
  transferId: any;
  isLoading: boolean = false;
  transferDetails: any = {};
  currentTab: string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "history"];
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
    private util: Util,private location: Location) {
  }

  ngOnInit() {
    this.transferId = this.route.snapshot.paramMap.get('id')!;
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;  
    this.getTransferDetails(this.transferId);
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);

  }

  getTransferDetails(id:any) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_TRANSFER_GET_DETAILS_BY_ID, id).then((data: any) => {
      if (data) {
        this.transferDetails = data;
        this.employeeId = data.employeeId;        
        this.jobChangeDetails = data.jobChangeDetailsList;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
  
  onTabClick(index) {
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
  }

  goBack() {
    this.location.back();
  }

}
