import { AuthData } from './../auth/auth.model';
import { MessageBoard } from './message-board.model';
import { APIURLS } from './../shared/api-url';
import { AppComponent } from './../app.component';
import { HttpService } from './../shared/http-service';
import { Component, OnInit } from '@angular/core';
declare var jQuery: any;
import * as _ from "lodash";
import { Router } from '@angular/router';

@Component({
  selector: 'app-message-board',
  templateUrl: './message-board.component.html',
  styleUrls: ['./message-board.component.css']
})
export class MsgBoardComponent implements OnInit {
    
    public tableWidget: any;
    divisionList: any[];
    selDiv: any;
    messageBoardList: MessageBoard[];
    messageBoardItem: MessageBoard = new MessageBoard(0, '', '','', '', false);
    isLoading: boolean = false;
    msgHeaderList: any[];
    errMsg: string = "";
    startDate:string="";
    addDays: Date = new Date();
    //todayDate: string = this.conDate.setDate(new Date().getDate() + 7).toString();
    endDate: string="";
    isLoadingPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;
    path:string = '';
    constructor(private appService: AppComponent, private httpService: HttpService, private router: Router) { }


    private initDatatable(): void {
        let exampleId: any = jQuery('#messageBoardTable');
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
        this.getMsgHeaders();
        this.getMsgBoardMasterList();
      }
      else 
        this.router.navigate(["/unauthorized"]);
    }
    ngAfterViewInit() {
        this.initDatatable()
    }

    closeSaveModal() {
      ////console.log('testpop')
      jQuery("#myModal").modal('hide');
      
      // window.location.reload();
    }
    getMsgBoardMasterList() {
      this.errMsg = "";
      this.isLoading = true;
      this.httpService.get(APIURLS.BR_MASTER_DISPLAYMSGBOARD_API).then((data: any) => {
        this.isLoading = false;
          this.messageBoardList = data;
          // this.messageBoardList = this.messageBoardList.filter(s=>s.IsActive !=false);
          ////console.log(this.messageBoardList)
          this.reInitDatatable();
        
      }).catch(error => {
        this.isLoading = false;
        this.messageBoardList = [];
      });
    }


    onAddMsgBoard(isEdit: boolean, data: MessageBoard) {
      this.isEdit = isEdit;
      this.errMsgPop = "";
      //var endDt = this.endDate.setDate(this.endDate.getDate() + 7);
      //this.endDate = new Date(endDt);
      this.isLoadingPop = false;
      if (this.isEdit) {
        this.messageBoardItem = data;
              this.startDate = this.messageBoardItem.startDate; //<= 0 ? this.startDate : new Date(this.calendarItem.startDate);
        this.endDate = this.messageBoardItem.endDate;// <= 0 ? this.endDate : new Date(this.calendarItem.endDate);
        // this.addDays = new Date();
        // var endDt = this.addDays.setDate(+this.startDate.getDate() + 7);
        // this.endDate = this.messageBoardItem.endDate <= 0 ? new Date(endDt) : new Date(this.messageBoardItem.endDate);
      }
      else {
        this.messageBoardItem = new MessageBoard(0, '', '','', '', false);
        this.startDate = null;
        this.endDate = null;
        var endDt = null;
        // this.endDate = new Date(endDt);
        //this.endDate = null;
      }
      jQuery("#myModal").modal('show');
    }
    setStartDate(startD: any) {
      this.errMsgPop = '';
      var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
      if ((date_regex.test(startD))) {
          this.startDate = startD;
        
      }
      else if (startD == "") {
          this.errMsgPop = 'Enter valid Start Date';
      }
  }

  setEndDate(endD: any) {
      this.errMsgPop = '';
      var date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;
      if ((date_regex.test(endD))) {
          this.endDate = endD;
      }
      else if (endD == "") {
          this.errMsgPop = 'Enter valid End Date';
      }
  }
    onSaveMsgBoard(status: boolean) {
      this.errMsg = "";
      this.errMsgPop = "";
      this.isLoadingPop = false;
      if (((new Date(this.startDate)) < (new Date(this.endDate))) || (this.endDate == undefined || this.endDate==null)) {
        if (this.startDate == undefined) {
          this.messageBoardItem.startDate = null
        }
        else {
          this.messageBoardItem.startDate = this.startDate;
        }
        if (this.endDate == undefined) {
          this.messageBoardItem.endDate = null;
        }
        else {
          this.messageBoardItem.endDate = this.endDate;
        }

        let connection: any;
        if (!this.isEdit) {
          ////console.log(this.messageBoardItem)
          connection = this.httpService.post(APIURLS.BR_MASTER_MSGBOARD_API, this.messageBoardItem);
          connection.then((data: any) => {
            this.isLoadingPop = false;
            this.reInitDatatable();
            if (data.id>0) {

                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = 'Message data saved successfully!';
                jQuery("#saveModal").modal('show');
                this.getMsgBoardMasterList();
            }
            else {
                this.errMsgPop = data;
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving calendar data..';
        });
        }
        else {
          connection = this.httpService.put(APIURLS.BR_MASTER_MSGBOARD_API, this.messageBoardItem.id, this.messageBoardItem);
          connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data==200) {
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = 'Message data saved successfully!';
 jQuery("#saveModal").modal('show');
                this.getMsgBoardMasterList();
            }
            else {
                this.errMsgPop = data;
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error saving calendar data..';
        });
        }

        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data.status == 200) {
            jQuery("#myModal").modal('hide');
            
 this.errMsgPop1 = 'Message data saved successfully!';
 jQuery("#saveModal").modal('show');
            this.getMsgBoardMasterList();
          }
          else {
            this.errMsgPop = data;
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error saving message..';
        });
      }
      else if ((new Date(this.startDate)) >= (new Date(this.endDate))) {
        this.isLoadingPop = false;
        this.errMsgPop = 'End date should be greater than start date';
      }
      else {
        if (this.startDate == undefined || this.startDate==null) {
          this.messageBoardItem.startDate =null;
        }
        else {
          this.messageBoardItem.startDate = this.startDate;
        }
        if (this.endDate == undefined || this.endDate==null) {
          this.messageBoardItem.endDate = null;
        }
        else {
          this.messageBoardItem.endDate = this.endDate;
        }

        let connection: any;
        if (!this.isEdit) {
          connection = this.httpService.post(APIURLS.BR_MASTER_MSGBOARD_API, this.messageBoardItem);

        }
        else {
          connection = this.httpService.put(APIURLS.BR_MASTER_MSGBOARD_API, this.messageBoardItem.id, this.messageBoardItem);
        }

        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data.status == 200) {
            jQuery("#myModal").modal('hide');
            this.errMsgPop1 = 'Message data saved successfully!';
 jQuery("#saveModal").modal('show');
            this.getMsgBoardMasterList();
          }
          else {
            this.errMsgPop = data;
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error saving message..';
        });
      }
    }
    getMsgHeaders() {
        this.httpService.get(APIURLS.BR_FORM_DATA_API).then((data: any) => {
            if (data.status == 200) {
                this.msgHeaderList = data;
                // debugger;
         //     this.msgHeaderList = data.find(s => s == '19'); //_.filter(data.formData, function (obj) { if (obj.name == 'Entity') return obj; });
            //  ////console.log(this.msgHeaderList);
            }
        }).catch(error => {
            this.msgHeaderList = null;
        });
    }
}
