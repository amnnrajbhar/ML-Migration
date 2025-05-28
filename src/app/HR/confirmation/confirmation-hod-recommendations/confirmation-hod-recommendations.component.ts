import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-confirmation-hod-recommendations',
  templateUrl: './confirmation-hod-recommendations.component.html',
  styleUrls: ['./confirmation-hod-recommendations.component.css']
})
export class ConfirmationHodRecommendationsComponent implements OnInit {
  details: any = {};
  @Input() employeeConfirmationId!: number;
  isLoading: boolean = false;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;
    this.loadRecommendationsData(this.employeeConfirmationId);
  }

  loadRecommendationsData(id:any) {
    this.isLoading = true;
    this.httpService.HRgetById(APIURLS.CONFIRMATION_GET_HOD_RECOMMENDATIONS_DETAILS, id).then((data: any) => {
      if (data) {
        this.details = data;

        this.isLoading = false;
      }
    }).catch((error)=> {
      this.isLoading = false;
    });
  }
}
