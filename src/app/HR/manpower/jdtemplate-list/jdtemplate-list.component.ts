import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
declare var $: any;

@Component({
  selector: 'app-jdtemplate-list',
  templateUrl: './jdtemplate-list.component.html',
  styleUrls: ['./jdtemplate-list.component.css']
})
export class JdtemplateListComponent implements OnInit {

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, private excelService: ExcelService) { }

  filterModel: any = {};
  filterData: any = {};
  isLoading: boolean = false;
  ngOnInit() {
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.HR_MANPOWER_GET_JD_TEMPLATE_LIST, this.filterModel)
   
      .then((data: any) => {
        this.filterData = data;
   
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
      });
  }

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getData();
  }
}
