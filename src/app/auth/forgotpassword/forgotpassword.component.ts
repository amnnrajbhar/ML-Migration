import { AuthData } from './../auth.model';
import { APIURLS } from '../../shared/api-url';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import swal from 'sweetalert';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})

export class ForgotpasswordComponent implements OnInit {
    //returnUrl: string
    passwordData = { employeeId: ''};
    public errMsg: string = '';
  public errMsg1: string = '';
  public emailMsg1: string = '';
  isLoading: boolean = false;
    constructor(private authservice: AuthService,private httpService: HttpService,
        private router: Router,
        private route: ActivatedRoute, ) { }

    ngOnInit() {
       // this.authservice.logout();
        // get return url from route parameters or default to '/'
        //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
    newpassword:string='';
    confirmpassword:string='';
    mismatch!: boolean;
    forgotpassword(){
      if (this.newpassword != this.confirmpassword)
      swal('', 'New password and confirm password does not match', 'warning');    
    else {
      this.mismatch = false;
        this.isLoading =true;
       // let type="ForgotPassword";
      this.httpService.forgotsendmail(APIURLS.BR_MASTER_FORGOTSENDEMAIL_API, this.passwordData.employeeId,this.newpassword ).then((dataemail: any) => {
        if (dataemail == 200) {
          this.isLoading = false;
          // this.errMsg1 = '';
          // this.newpassword='';
          // this.confirmpassword='';
          let msg="Password Changed Successfully";
          swal(msg, {
            icon: "success",
          }).then((willsave) => {
            if (willsave) {
              //this.getAllGateEntries('print');
              this.router.navigateByUrl('/login?returnUrl=%2Finitpage');
            }
          });
          //this.emailMsg1 = "Password Changed Successfully";
        }
        else {
          this.isLoading = false;
          this.errMsg1 = "Please Enter a Valid employee ID";
          this.emailMsg1 = '';
        }
      }).catch((error)=> {
        ////console.log(error);
        this.isLoading = false;
        this.emailMsg1 = '';
        swal("", error.Message, "error");
        // alert(error.Message);
      });
    }
  }
}
