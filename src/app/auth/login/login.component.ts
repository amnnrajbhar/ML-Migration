import { AuthData } from './../auth.model';
import { Employee } from './../../masters/employee/employee.model';
import { APIURLS } from './../../shared/api-url';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from './../../app.component';
import { HttpService } from './../../shared/http-service';
import { AuthService } from '../auth.service';
import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert';
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  returnUrl: string;
  userList: Employee[];
  loginData = { username: '', password: '', tenantId: 1 };
  isLoading: boolean = false;
  public errMsg: string = '';
  public errMsg1: string = '';
  public emailMsg1: string = '';
  IpAddress:string;
  year:any;
  image:any;

  constructor(private authservice: AuthService,
    private appService: AppComponent,
    private router: Router,
    private route: ActivatedRoute,
    private http:HttpClient,
    private httpService: HttpService) { }

  ngOnInit() {
    this.authservice.logout();
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.year=new Date().getFullYear();
    // setTimeout(() => {
    //   window.location.reload();
    // }, 10000); // Activate after 5 minutes.
    this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{
      this.IpAddress=res.ip;
  });
  }


  onLogin() {
    this.isLoading = true;
    if (this.loginData.username == '') {
      this.isLoading = false;
      alert('Please enter username');
      return;
    }
    else if (this.loginData.password == '') {
      this.isLoading = false;
      alert('Please enter password');
      return;
    }
    else {
    this.authservice.login(this.loginData.username, this.loginData.password,this.loginData.tenantId,this.IpAddress).then((data: any) => {
      this.isLoading = false;
      if (data) {
         if(data.locked==1)
        {
          this.isLoading = false;
          alert('Your account is locked, since you have entered the wrong password 5 times. Please contact admin.');
         // this.emailMsg1 = 'Account is locked. Please contact admin';
        }
        else if(data.locked==2)
        {
          this.isLoading = false;
          alert('User is already logged in another device. Please logout from the other session to continue');
        }
        else if (data.status) {
          this.authservice.authData = new AuthData(true, data.uid, this.loginData.username, data.firstName, data.lastName, data.usr_country, data.email, data.roles, data.access_token, data.isapprover, 
            data.usr_level, data.roleId, data.status, data.imgurl, data.employeeId, data.fkEmpId, (data.expires_in * 1000) + new Date().getTime(), 
            data.last_Login_datetime, data.token_expiry_date, data.fullName, data.passwordExpired, data.baselocation, data.fK_Designation, 
            data.designation, data.fkProfileId, data.fK_Department, data.department, data.joiningDate, data.reportingManager,
            data.division, data.locked, data.hrEmployeeId, data.permissions);
          this.authservice.authData.profileIDs = data.profileIDs.split(",");
          localStorage.setItem('currentUser', JSON.stringify(this.authservice.authData));
          
          if (!data.last_Login_datetime) {
            swal({
              title: "You have logged for the first time, click OK to change the password.",
              icon: "warning",
              buttons: [false, true],
            })
              .then((willsave) => {
                if (willsave) {
                    this.router.navigate(['/changepassword']);
                }
              });
          }
          else if (data.passwordExpired) {
            swal({
              title: "Your password has been expired. Please change your password.",
              icon: "warning",
              buttons: [false, true],
            })
              .then((willsave) => {
                if (willsave) {
                    this.router.navigate(['/changepassword']);
                }
              });
          }
          if (this.authservice.authData.isAuth == true) {
            
            this.router.navigate([this.returnUrl]);
            //load app-root on login
            this.appService.ngOnInit();            
            this.UpdateUserLog();
            //location.reload();
          }
        }
        else {
          this.isLoading = false;
          this.emailMsg1 = 'User is inactive. Please contact to system admin';
          //this.errMsg.length == 1;
          // this.errMsg = 'error.status';
        }
      }
      else {
        this.isLoading = false;
        this.emailMsg1 = 'User Name and Password not Matched! Please verify again';
        // this.errMsg.length ==1;
        // this.errMsg = 'error.status';
      }
      // if (this.authservice.authData.isAuth == false) {
      // this.isLoading = false;
      // this.emailMsg1 = 'User Name and Password not Matched! Please verify again';
      // this.errMsg.length ==1;
      // }

    }).catch((error: any) => {
      this.isLoading = false;
      this.emailMsg1 = 'User Name and Password not Matched! Please verify again';
      this.errMsg.length == 1;
      this.errMsg = error.status;
    });
  }
  }


 

  // validateUser(username) {
  //   let connection: any;
  //   if (username == undefined || username == '')
  //   {
  //       this.errMsg1 = "Enter UserId";
  //       this.emailMsg1 = '';
  //   }
  //   else {
  //     this.isLoading = true;
  //     this.router.navigateByUrl('/forgotpassword');
  //     //  this.httpService.forgotpassword(APIURLS.BR_FORGOTPASSWORD_API, username, this.loginData).then((data: any) => {

  //     //   this.isLoading = false;
  //     //   if (data.status == 'SUCCESS') {
  //     //       this.errMsg1 = '';
  //     //       this.emailMsg1= data;
  //     //   }
  //     //   if (data.status == 'ERROR') {
  //     //       this.errMsg1 = data;
  //     //       this.emailMsg1 = '';
  //     //   }
  //     // }).catch(error => {
  //     //   this.isLoading = false;
  //     //   this.errMsg1 = error.message;
  //     //   this.emailMsg1 = '';
  //     // });

  //   }
  // }


  validateUser(username) {
    let connection: any;
    if (username == undefined || username == '') {
        this.errMsg1 = "Enter UserId";
        this.emailMsg1 = '';
    }
    else {
      this.isLoading = true;
      this.router.navigateByUrl('/passwordreset');
      //  this.httpService.forgotpassword(APIURLS.BR_FORGOTPASSWORD_API, username, this.loginData).then((data: any) => {

      //   this.isLoading = false;
      //   if (data.status == 'SUCCESS') {
      //       this.errMsg1 = '';
      //       this.emailMsg1= data;
      //   }
      //   if (data.status == 'ERROR') {
      //       this.errMsg1 = data;
      //       this.emailMsg1 = '';
      //   }
      // }).catch(error => {
      //   this.isLoading = false;
      //   this.errMsg1 = error.message;
      //   this.emailMsg1 = '';
      // });

    }
  }

  UpdateUserLog() {
   // this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{
      //console.log(data);
      //this.ipAddress=res.ip;
      var filterModel:any={};
      filterModel.employeeId=this.loginData.username;
      filterModel.application='UNNATI';
      filterModel.activity='LOGIN';
    //  filterModel.ipAddress=res.ip;

      this.httpService.post(APIURLS.BR_UPDATE_USER_LOG, filterModel).then((data) => {
        if(data.length>0)
        {
          
        }
      }).catch((error)=>{
        console.log(error);
      });
    //  });    
  }
}
