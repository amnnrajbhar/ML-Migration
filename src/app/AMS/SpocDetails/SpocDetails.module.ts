import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpocDetailsComponent } from './SpocDetails.component';
import { SpocDetailsRoutingModule } from './SpocDetails-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        SpocDetailsRoutingModule
    ],
    declarations: [SpocDetailsComponent],
    providers: [DatePipe]
})
export class SpocDetailsModule { }
