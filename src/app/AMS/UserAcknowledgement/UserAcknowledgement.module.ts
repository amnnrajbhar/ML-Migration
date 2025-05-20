import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserAcknowledgementComponent } from './UserAcknowledgement.component';
import { UserAcknowledgementRoutingModule } from './UserAcknowledgement-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        UserAcknowledgementRoutingModule
    ],
    declarations: [UserAcknowledgementComponent],
    providers: [DatePipe]
})
export class UserAcknowledgementModule { }
