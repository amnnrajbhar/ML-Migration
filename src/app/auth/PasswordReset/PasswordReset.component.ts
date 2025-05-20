import { AuthData } from './../auth.model';
import { APIURLS } from '../../shared/api-url';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import swal from 'sweetalert';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { Users } from './PasswordReset.model';
@Component({
  selector: 'app-PasswordReset',
  templateUrl: './PasswordReset.component.html',
  styleUrls: ['./PasswordReset.component.css']
})

export class PasswordResetComponent implements OnInit {
    //returnUrl: string;
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

    usermodel={} as Users
    QuestionsList:any=[
      {id:1 ,name:'In what city or town was your first job?'},
      {id:2 ,name:'What is your mothers maiden name?'},
      {id:3 ,name:'What is the name of the first school you attended?'},
      {id:4 ,name:'Which is your place of birth?'},
      {id:5 ,name:'What was your childhood nickname?'}
    ]
    newpassword:string='';
    confirmpassword:string='';
    mismatch: boolean;
    date:any;
    Validatepassword(){      
        this.isLoading =true;
       // let type="ForgotPassword";
       this.usermodel.doj=this.getDateFormate(this.date);

      
      this.httpService.forgotsendmail(APIURLS.BR_VALIDATE_PASSWORD_API, this.usermodel.employeeId,this.usermodel ).then((dataemail: any) => {
        if (dataemail == 200) {
          this.isLoading = false;         
          this.router.navigateByUrl('/forgotpassword');        
        }
        else {
          this.isLoading = false;    
          let msg="Values entered are incorrect..!";
          swal(msg, {
            icon: "warning",
          })
        }
      }).catch(error => {
        //console.log(error);
        this.isLoading = false;
        this.emailMsg1 = '';
        swal("", error.Message, "error");
        // alert(error.Message);
      });
    
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }
}
