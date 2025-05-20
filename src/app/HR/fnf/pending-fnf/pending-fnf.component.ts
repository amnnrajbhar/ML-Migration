import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { CompleteTaskRequest } from '../../pending-tasks/completeTaskRequest.model';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { APIURLS } from '../../../shared/api-url';
import { Util } from '../../Services/util.service';
import { AppComponent } from '../../../app.component';
import { setActionValue } from 'sweetalert/typings/modules/state';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';
import { Resignation } from '../../separation/resignation/resignation.model';
import { NewOffer } from '../../Offer/new-offer/newoffer.model';
declare var $: any;
declare var toastr: any;
declare var require: any;

@Component({
  selector: 'app-pending-fnf',
  templateUrl: './pending-fnf.component.html',
  styleUrls: ['./pending-fnf.component.css'],
  providers: [Util]
})
export class PendingFnfComponent implements OnInit {
  employeeId: any;
  fnfId: any;
  taskId: any;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private fb: FormBuilder,
    private util: Util,private location: Location) { }

  ngOnInit() {
    this.fnfId = this.route.snapshot.paramMap.get('id')!;
    this.taskId = this.route.snapshot.paramMap.get('id2')!;
    this.employeeId = this.route.snapshot.paramMap.get('id3')!;
    //this.currentUser = JSON.parse(localStorage.getItem('currentUser')); 
  }

}
