import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITTicketRoutingModule } from './itticket-routing.module';
import { ITTicketComponent } from './itticket.component';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ITTicketRoutingModule,
       
    ],
    declarations: [
        ITTicketComponent,
    ]
})
export class itticketModule { }
