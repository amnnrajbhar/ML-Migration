import { User } from './../../masters/user/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { APIURLS } from './../../shared/api-url';
import { Component, OnInit } from '@angular/core';
import { HttpService } from './../../shared/http-service';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetPasswordComponent implements OnInit {
    hideLoginForm: boolean = false;
    resetPwdToken: string;
    isLoading: boolean = false;
    userItem: User = new User(0, 0, '', '', '', 0, 0, 0, '', 0, '', '', '', '', '', '', '', '', '', 0, 0, true, '', '', true);;
    public sucessMsg: string = '';
    public pwdMsg1: string = '';
    public rePwdMsg1: string = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private httpService: HttpService ) { }

    ngOnInit() {
        this.resetPwdToken = this.route.snapshot.queryParams['token'];
    }

    resetPassword(pwd, confirmPwd) {
        let connection: any;
        if (pwd == undefined || pwd == '') {
            this.pwdMsg1 = "Enter Password";
            this.rePwdMsg1 = '';
            this.sucessMsg = '';
        }
        else if (confirmPwd == undefined || confirmPwd == '') {
            this.rePwdMsg1 = "Retype Password";
            this.pwdMsg1 = '';
            this.sucessMsg = '';
        }
        else if (pwd != confirmPwd) {
            this.pwdMsg1 = "Password didn't match";
            this.rePwdMsg1 = '';
            this.sucessMsg = '';
        }
        else {
            this.isLoading = true;
            this.httpService.forgotpassword(APIURLS.BR_RESET_PASSWORD_API, this.resetPwdToken, this.userItem).then((data: any) => {
                this.isLoading = false;
                if (data.status == 'SUCCESS') {
                    this.pwdMsg1 = '';
                    this.sucessMsg = data;
                }
                if (data.status == 'ERROR') {
                    this.pwdMsg1 = data;
                    this.rePwdMsg1 = '';
                }
            }).catch(error => {
                this.isLoading = false;
                this.pwdMsg1 = error.message;
                this.rePwdMsg1 = '';
            });

        }
    }

    gotoLoginForm() {
        this.router.navigate(["/login"]);
    }

}
