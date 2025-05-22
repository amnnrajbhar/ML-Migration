import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { APIURLS } from '../shared/api-url';
import { AppService } from '../shared/app.service';
import { HttpService } from '../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
import { AmcvisitDetails } from '../UpdateAMCDetails/AMCDetails.model';
declare var $: any;

@Component({
  selector: 'app-ViewAMCDetails',
  templateUrl: './ViewAMCDetails.component.html',
  styleUrls: ['./ViewAMCDetails.component.css'],
})

export class ViewAMCDetailsComponent implements OnInit {

  VisitorId: any;
  isLoading: boolean = false;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  successMsg: string = "";
  VisitorDetails: any = {};
  amcdetailsmodel = {} as AmcvisitDetails;


  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: HttpClient,
  ) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.VisitorId = this.route.snapshot.paramMap.get('id');
      this.getVisitorDetails();
    }
  }

  getVisitorDetails() {
    this.isLoading = true;
    let connection: any;
    connection = this.httpService.getById(APIURLS.BR_MASTER_VISITOR_POST_API, this.VisitorId);
    connection.then((data) => {
      if (data) {
        this.VisitorDetails = data;
        this.getAMCDetailsById();
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
    })
  }
  EquipmentList:any[]=[];
  getAMCDetailsById()
  {
    this.isLoading = true;
    let connection: any;
    connection = this.httpService.getById(APIURLS.GET_AMC_VISIT_DETAILS_BY_ID, this.VisitorId);
    connection.then((data) => {
      if (data.length>0) {
        this.amcdetailsmodel= Object.assign({},data[0])
        data.forEach(element => {
          let equip = new AmcvisitDetails();
          equip.equipmentId = element.equipmentId;
          equip.equipmentName = element.equipmentName;
          equip.modelNo = element.modelNo;
          equip.status = element.status;
          equip.id = element.id;
          this.EquipmentList.push(equip);
        });
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
    })
  }
  goBack()
  {
    this.router.navigate(['/locationwiseReport']);
  }

}
