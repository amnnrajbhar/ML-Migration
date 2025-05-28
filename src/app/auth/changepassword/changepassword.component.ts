import { Component, OnInit, ViewChild } from '@angular/core';
import { APIURLS } from '../../shared/api-url';
import { AuthData } from '../auth.model';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../shared/http-service';
import { Router } from '@angular/router';
import { UserMaster } from '../../masters/employee/user-master.model';
import swal from 'sweetalert';
import { NgForm } from '@angular/forms';
//import { Http } from '@angular/http';
@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {
 @ViewChild(NgForm, { static: false }) sbuForm!: NgForm;
  newPassword: string = "";
  confirmPassword: string = "";
  mismatch!: boolean;
  currentUser!: AuthData;
  urlPath: string = '';
  userMasterItem: UserMaster = new UserMaster(0, 0, '', '', '', '', 0, '', '', '', '', 0, 0, 0, 0, 0,'');
  isLoading!: boolean;
  errMsgPop: string="";
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
           ) { }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.httpService.getById(APIURLS.BR_MASTER_USERMASTER_API, this.currentUser.uid).then((data: any) => {
      if (data.id > 0) {
        this.userMasterItem = data;
      }
    }).catch((error)=> {
      this.userMasterItem = null;
    });
  }
  updatePassword() {
    let connection: any;
    var pass:any[]=[];
    pass=this.userMasterItem.lastPassword!=null?this.userMasterItem.lastPassword.split(','):[];
    if (this.newPassword != this.confirmPassword)
      swal('', 'New password and confirm password does not match', 'warning');
    else if (this.userMasterItem.password == this.newPassword)
      swal('','New password should not be same as old password','warning');
   
    else {
      for(let i=0;i<pass.length;i++)
      {
        if(pass[i]==this.newPassword)
        {
          swal('','New password should not be same as last 8 old passwords','warning');
          return;
        }
      }
      this.mismatch = false;
      this.isLoading = true;
      this.userMasterItem.password = this.newPassword;
      connection = this.httpService.put(APIURLS.BR_MASTER_USERMASTER_API, this.userMasterItem.id, this.userMasterItem);
      connection.then((data: any) => {
        if (data) {
          let msg = 'Password updated successfully!';
          swal(msg, {
            icon: "success",
          }).then((willsave) => {
            if (willsave) {
              //this.getAllGateEntries('print');
            //  this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{
              let filtermodel:any={};
              filtermodel.employeeId=this.userMasterItem.employeeId;
              filtermodel.application='UNNATI';
              filtermodel.activity='LOGOUT';
            //  filtermodel.ipAddress=res.ip;
              this.httpService.post(APIURLS.BR_UPDATE_USER_LOG,filtermodel).then((data)=>{
        
              });
        //    });
              this.router.navigateByUrl('/login?returnUrl=%2Finitpage');
            }
          });
        }
      }).catch((error)=> {
        this.errMsgPop = "Password not updated...";
        this.isLoading = false;
      });
      this.isLoading = false;
    }
  }
}
