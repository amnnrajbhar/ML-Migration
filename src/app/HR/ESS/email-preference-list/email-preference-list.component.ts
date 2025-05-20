import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import { emailpreferencemodel } from '../email-preference-list/emailpreference.model';
import swal from 'sweetalert';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-email-preference-list',
  templateUrl: './email-preference-list.component.html',
  styleUrls: ['./email-preference-list.component.css']
})

export class EmailPreferenceListComponent implements OnInit {
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private excelService: ExcelService) { }
  // @Input() editAllowed: boolean = true;
  employeeId: number;
  currentUser: AuthData;
  isLoading: boolean = false;
  emailtypes: any[] = [];
  errorCount = 0;
  emailPreferenceExistCount = 0;
  emailpreferenceList: any[] = [];


  ngOnInit() {
    debugger;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.employeeId = this.currentUser.hrEmployeeId;
    this.emailtypes = [
      // { emailtype: "Offer Approval", enabled: true },
      // { emailtype: "Appointment Verification", enabled: true },
      // { emailtype: "Appointment Approval", enabled: true },
      // { emailtype: "Confirmation Recomendation ", enabled: true },
      // { emailtype: "Confirmation Approval", enabled: true },
      // { emailtype: "Appraisal Recomendation", enabled: true },
      // { emailtype: "Appraisal Approval", enabled: true },
      // { emailtype: "Resignation Approval", enabled: true },
      // { emailtype: "Service Withdrawn Approval", enabled: true },
      // { emailtype: "Retirement Extension Approval", enabled: true },
      // { emailtype: "Recall Approval", enabled: true },
      // { emailtype: "FnF Approval", enabled: true },
      { emailtype: "Task Approved", enabled: true }
    ];

    this.getData();
  }


  getData() {
    this.isLoading = true;
    this.httpService.HRgetById(APIURLS.EMAILPREFERENCE_GET_ALL_EMAILPREFERENCE, this.employeeId).then((data: any) => {
      for (var result of data) {
        var existingEmailType = this.emailtypes.find(x => x.emailtype == result.emailType);
        if (existingEmailType != null) {
          this.emailtypes.find(x => x.emailtype == result.emailType).enabled = result.enabled;
        }
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  UpdateEmailPreferences() {
    this.emailpreferenceList = [];
    for (var t of this.emailtypes) {
      var request = {} as emailpreferencemodel;
      t.employeeId = this.currentUser.hrEmployeeId;
      request.employeeId = t.employeeId;
      request.emailType = t.emailtype;
      request.enabled = t.enabled
      this.emailpreferenceList.push(request);
    }
    this.errorCount = 0;
    toastr.info("Updating...");

    this.httpService.HRpost(APIURLS.UPDATE_EMAILPREFERENCE, this.emailpreferenceList)
      .then((data: any) => {
        if (data == 200 || data.success) {
          debugger;
          toastr.success("Successfully Updated.");
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred while Updating.");
        this.isLoading = false;
      }).catch(error => {
        toastr.error(error);
        this.isLoading = false;
      });
  }
}

