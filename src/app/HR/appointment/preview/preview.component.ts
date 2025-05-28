import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
//import { Util } from '../Services/util.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {Pipe, PipeTransform} from "@angular/core";

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {
  appointmentId: any;
  currentUser!: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  details: any = {};

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private http: HttpClient, private location: Location) {  }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
   const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
      this.appointmentId = this.route.snapshot.paramMap.get('id')!;
      this.LoadDetails(this.appointmentId);
    }
  }

  
  LoadDetails(id:any) {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.APPOINTMENT_GET_LETTER_FOR_PRINT+"/"+ id).then((data: any) => {
      if (data) {
        this.details = data;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
      this.details = null;
    });
  }

  goBack() {
    this.location.back();
  }
}
