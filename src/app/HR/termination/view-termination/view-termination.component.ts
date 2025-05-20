import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { Termination } from '../termination/termination.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import swal from 'sweetalert';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { TerminationUpdateRequest } from '../termination-list/terminationupdaterequest.model';
import { AuthData } from '../../../auth/auth.model';
declare var $: any;
declare var require: any;
declare var toastr: any;

@Component({
  selector: 'app-view-termination',
  templateUrl: './view-termination.component.html',
  styleUrls: ['./view-termination.component.css']
})
export class ViewTerminationComponent implements OnInit {
  currentUser: AuthData;
  terminationId: any;
  employeeId: any;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  isRejected: boolean = false;
  isEditAllowed: boolean = false;
  isWithdrawAllowed: boolean = false;  
  terminationStatus :any;
  
  terminationDetails= {} as Termination;
  employeeDetails :any={};
  DateToday :Date ;
  DateLastWorkingDay :string ;
  TerminationDate :string;
  currentTab:string = "details";
  tabIndex: number = 0;
  tabsList: string[] = ["details", "attachments","checklist","exitinterview", "history"];
  objectType: string = "Termination";
  fileList: any[] = [];
  noticePeriod: string;
  action: string;
  comments: string;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.terminationId = this.route.snapshot.paramMap.get('id')!;  
      this.GetTerminationDetailsById(this.terminationId);    
      
    }
  }

  GetTerminationDetailsById(id) {
    this.isLoading = true;
   
    this.httpService.HRget(APIURLS.TERMINATION_DETAILS_GET_BYID + "/" + id).then((data: any) => {
      if (data) {
         this.terminationDetails=data;
         this.fileList = data.attachments;
         this.employeeId = data.employeeId;
         this.terminationStatus= this.terminationDetails.status;
         this.TerminationDate = this.getDateFormate(this.terminationDetails.terminationDate);
         this.noticePeriod = this.terminationDetails.noticePeriod+' Month(s)';
         if (this.terminationStatus == "Submitted" || this.terminationStatus == "Pending For Approval") {
          this.isWithdrawAllowed = true;
        }
        else if (this.terminationStatus == "Rejected") {
          this.isEditAllowed = true;
          this.isRejected = true;
        }
        else {
          this.isEditAllowed = false;
          this.isWithdrawAllowed = false;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.errMsg= error;
    });
  }


onTabClick(index)
{
  this.tabIndex = index;
  this.currentTab = this.tabsList[this.tabIndex];
}

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  Back(){
    this.location.back();
  }
}
