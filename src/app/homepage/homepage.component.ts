import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthData } from '../auth/auth.model';
import { HttpService } from '../shared/http-service';
import { APIURLS } from '../shared/api-url';
import { SafeHtmlPipe } from '../HR/Services/safe-html.pipe';
import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  isLoading: boolean = false;
  currentUser!: AuthData;
  announcements: any[] = [];
  yesterdayBirthdays: any[] = [];
  todayBirthdays: any[] = [];
  tomorrowBirthdays: any[] = [];
  thisMonthJoiners: any[] = [];
  lastMonthJoiners: any[] = [];
  moreLinks: any[] = [];
  socialLinks: any[] = [];
  today = new Date();
  reloadflag!: number;
  tomorrow = new Date(Date.now() + (60 * 60 * 24 * 1000));
  yesterday = new Date(Date.now() - (60 * 60 * 24 * 1000));
  PendingCount: any = 0;


  constructor(private httpService: HttpService,
    private router: Router, private readonly sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload')
      location.reload()
      this.reloadflag = 1;
    } else {
      localStorage.removeItem('foo')
      this.reloadflag = 1;
    }
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    if (this.reloadflag == 1) {
      $('#calendar').datepicker();
      //v10
      // this.getTopAnnouncements();
      // this.getBirthdaysAndAnniversaries();
      this.getNewJoiners();
      this.getMoreLinks();
      this.getSocialLinks();
      this.getUIDcount();
      //  this.getAlerts();
      this.reloadflag = 0
    }

  }

  getTopAnnouncements() {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.HR_ANNOUNCEMENT_GET_ALL_ACTIVE_ANNOUNCEMENTS).then((data: any) => {
      if (data && data.length > 0) {
        this.announcements = data;
      }

      this.isLoading = false;
    }).catch((error)=> {
      toastr.error("Error while fetching the announcements. Error: " + error);
      this.isLoading = false;
    });
  }

  getBirthdaysAndAnniversaries() {
    this.isLoading = true;
    //this.httpService.get(APIURLS.EMPLOYEE_GET_BIRTHDAYS_ANNIVERSARY_LIST + "/" + this.currentUser.employeeId).then((data: any) => {
    this.httpService.get(APIURLS.EMPLOYEE_GET_BIRTHDAYS_ANNIVERSARY_LIST_HR_EMPLOYEE + "/" + this.currentUser.employeeId).then((data: any) => {
      if (data && data.length > 0) {

        data.forEach((x:any)  => {
          if ((new Date(x.dob).getDate() == this.today.getDate() && new Date(x.dob).getMonth() == this.today.getMonth())
            || (new Date(x.dob).getDate() == this.yesterday.getDate() && new Date(x.dob).getMonth() == this.yesterday.getMonth())
            || (new Date(x.dob).getDate() == this.tomorrow.getDate() && new Date(x.dob).getMonth() == this.tomorrow.getMonth())) {
            x.birthday = true;
            x.anniversary = false;
          }
          if ((new Date(x.joiningDate).getDate() == this.today.getDate() && new Date(x.joiningDate).getMonth() == this.today.getMonth())
            || (new Date(x.joiningDate).getDate() == this.yesterday.getDate() && new Date(x.joiningDate).getMonth() == this.yesterday.getMonth())
            || (new Date(x.joiningDate).getDate() == this.tomorrow.getDate() && new Date(x.joiningDate).getMonth() == this.tomorrow.getMonth())) {
            x.anniversary = true;
            x.birthday = false;
            x.years = x.tenure.substring(0, 2);
          }
        });
        this.todayBirthdays = data.filter((x:any)  => (new Date(x.dob).getDate() == this.today.getDate() && new Date(x.dob).getMonth() == this.today.getMonth())
          || (new Date(x.joiningDate).getDate() == this.today.getDate() && new Date(x.joiningDate).getMonth() == this.today.getMonth()));

        this.yesterdayBirthdays = data.filter((x:any)  => (new Date(x.dob).getDate() == this.yesterday.getDate() && new Date(x.dob).getMonth() == this.yesterday.getMonth())
          || (new Date(x.joiningDate).getDate() == this.yesterday.getDate() && new Date(x.joiningDate).getMonth() == this.yesterday.getMonth()));

        this.tomorrowBirthdays = data.filter((x:any)  => (new Date(x.dob).getDate() == this.tomorrow.getDate() && new Date(x.dob).getMonth() == this.tomorrow.getMonth())
          || (new Date(x.joiningDate).getDate() == this.tomorrow.getDate() && new Date(x.joiningDate).getMonth() == this.tomorrow.getMonth()));
      }
      $('#calendar').datepicker();
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error("Error while fetching the birthdays list. Error: " + error);
      this.isLoading = false;
    });
  }

  // getAlerts() {
  //   let model: any = {};
  //   model.empId = this.currentUser.employeeId;
  //   this.httpService.LApost(APIURLS.GET_ALERTS_BASED_ON_EMP, model).then((data: any) => {
  //     if (data) {
  //       if (data.list.length > 0) {
  //         if (data.list[0].imageFilePath != null || data.list[0].imageFilePath != undefined) {
  //           let connection = this.httpService.LAdownloadFile(APIURLS.GET_ALERTS_IMAGE + "/" + data.list[0].allertId);

  //           connection.then((data: any) => {
  //             if (data != undefined) {
  //               this.showImageInViewer(data);
  //             }
  //           });
  //         }
  //         this.viewloginAnnouncementDetails(data.list[0]);
  //       }
  //     }
  //   }).catch((error)=> {
  //     // this.plant = '';
  //   });
  // }

  imageToShow: any;
  showImageInViewer(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageBase64String = reader.result;
      this.imageToShow = this.sanitizer.bypassSecurityTrustUrl(imageBase64String.toString());
      //   $("#ImageModal").modal('show');
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }
  getNewJoiners() {
    this.isLoading = true;
    //this.httpService.get(APIURLS.EMPLOYEE_GET_NEW_JOINERS_LIST + "/" + this.currentUser.employeeId).then((data: any) => {
    this.httpService.get(APIURLS.EMPLOYEE_GET_NEW_JOINERS_LIST_HR_EMPLOYEE + "/" + this.currentUser.employeeId).then((data: any) => {
      if (data && data.length > 0) {
        var thisMonth = new Date();
        var lastMonth = new Date(Date.now() - (60 * 60 * 24 * 1000 * 31));
        this.thisMonthJoiners = data.filter((x:any)  => new Date(x.joiningDate).getMonth() == thisMonth.getMonth());
        this.lastMonthJoiners = data.filter((x:any)  => new Date(x.joiningDate).getMonth() == lastMonth.getMonth());
      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error("Error while fetching the new joiners list. Error: " + error);
      this.isLoading = false;
    });
  }

  getMoreLinks() {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.HR_MORE_LINKS_GET_ALL_ACTIVE_MORE_LINKS).then((data: any) => {
      if (data && data.length > 0) {
        this.moreLinks = data;
      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error("Error while fetching the more links. Error: " + error);
      this.isLoading = false;
    });
  }

  getSocialLinks() {
    this.isLoading = true;
    this.httpService.HRget(APIURLS.HR_MORE_LINKS_GET_ALL_ACTIVE_SOCIAL_LINKS).then((data: any) => {
      if (data && data.length > 0) {
        this.socialLinks = data;
      }
      this.isLoading = false;
    }).catch((error)=> {
      toastr.error("Error while fetching the social links. Error: " + error);
      this.isLoading = false;
    });
  }

  employee: any = {};
  viewEmployeeDetails(item) {
    this.employee = item;
    $("#employeeDetailsModal").modal("show");
  }


  announcement: any = {};
  viewAnnouncementDetails(item) {
    this.announcement = item;
    $("#announcementModal").modal("show");
  }
  viewloginAnnouncementDetails(item) {
    this.announcement = item;
    $("#loginannouncementModal").modal("show");
  }

  getUIDcount() {
    this.isLoading = true;
    try {
      var filterModel: any = {};

      filterModel.status = "Pending";
      filterModel.creator = this.currentUser.employeeId;
      filterModel.export = true;
      this.httpService.post(APIURLS.BR_USERID_REQUESTS_FILTER_API, filterModel).then((data: any) => {
        if (data) {

          this.PendingCount = data.length;
        }
        //  this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;

      });


    }
    catch (error) {
      this.isLoading = false;
      alert(error);
    }

  }
}
