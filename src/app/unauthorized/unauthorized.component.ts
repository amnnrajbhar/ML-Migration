import { Component, OnInit } from '@angular/core';
import { unauthorized } from './unauthorized.model';
import { AuthData } from '../auth/auth.model';
import { RequestOptions, Headers } from '@angular/http';
import { APIURLS } from '../shared/api-url';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';


declare var jQuery: any;

@Component({
  selector: 'app-Unauthorized',
  templateUrl: './Unauthorized.component.html',
  styleUrls: ['./Unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {
  public tableWidget: any;
  parentList: any[];
  selParentRole: any;
  selCompetencyHead: any;
  selSbu: any;
  
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  isEdit: boolean = false;
  path: string = "";
  //constructor(private httpService: HttpService) { }

  private initDatatable(): void {
    let exampleId: any = jQuery('#compTable');
    this.tableWidget = exampleId.DataTable();
  }

private reInitDatatable(): void {
    if (this.tableWidget) {
        this.tableWidget.destroy()
        this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
}
  ngOnInit() {
    
  }
 getHeader(): any { 
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
  }
}
