import { Component, OnInit } from '@angular/core';
import { State } from './state.model';
import { APIURLS } from '../../shared/api-url';
import { HttpService } from '../../shared/http-service';
import { User } from '../user/user.model';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
declare var jQuery: any;

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.css']
})
export class StateComponent implements OnInit {

  public tableWidget: any;
  
  stateList: State[];
  stateItem: State  = new State(0,	'',	'',	true);
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  isLoadPop: boolean = false;
  errMsgPop: string = "";
  isEdit: boolean = false;
path:string = '';
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }
  private initDatatable(): void {
    let exampleId: any = jQuery('#stateTable');
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
    this.path = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.path);
    if(chkaccess == true){
      ////console.log(chkaccess);
      this.getStateMasterList();
    }
    else 
      this.router.navigate(["/unauthorized"]);
  }
  
  getStateMasterList(){
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_STATE_API).then((data: any) => {
        this.isLoading = false;
        if (data.length > 0) {
            this.stateList = data;
            
            this.reInitDatatable();
        }
    }).catch((error)=> {
        this.isLoading = false;
        this.stateList = [];
    });
  }

  onAddState(isEdit: boolean, data: State){
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    
    if (this.isEdit) {
         this.stateItem = data;
       }
       else {
          this.stateItem = new State(0, '', '', true);
        }
       jQuery("#myModal").modal('show');
      }

  onSaveState(){
    this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = true;
      
      let connection: any;
      if (!this.isEdit)
        connection = this.httpService.post(APIURLS.BR_MASTER_STATE_API_INSERT, this.stateItem);
      else
        connection = this.httpService.put(APIURLS.BR_MASTER_STATE_API_INSERT, this.stateItem.id, this.stateItem);
          connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200) {
              jQuery("#myModal").modal('hide');
              this.getStateMasterList();
            }
            else 
              this.errMsgPop = data;
            
          }).catch((error)=> {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving department data..';
          });
      
  }
  
}
