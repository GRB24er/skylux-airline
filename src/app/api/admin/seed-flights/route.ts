import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectDB();
    const ac = await Aircraft.find({ type: "commercial" }).limit(2);
    if (!ac.length) return NextResponse.json({ success: false, error: "No commercial aircraft found" }, { status: 400 });

    const now = new Date();
    const flights: any[] = [];
    const routes = [
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"DXB",ac2:"Dubai",aco:"UAE"},
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"JFK",ac2:"New York",aco:"USA"},
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"SIN",ac2:"Singapore",aco:"Singapore"},
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"LAX",ac2:"Los Angeles",aco:"USA"},
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"NRT",ac2:"Tokyo",aco:"Japan"},
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"SYD",ac2:"Sydney",aco:"Australia"},
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"ACC",ac2:"Accra",aco:"Ghana"},
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"CDG",ac2:"Paris",aco:"France"},
      {d:"LHR",dc:"London",dco:"United Kingdom",a:"FCO",ac2:"Rome",aco:"Italy"},
      {d:"JFK",dc:"New York",dco:"USA",a:"LAX",ac2:"Los Angeles",aco:"USA"},
      {d:"JFK",dc:"New York",dco:"USA",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"JFK",dc:"New York",dco:"USA",a:"CDG",ac2:"Paris",aco:"France"},
      {d:"JFK",dc:"New York",dco:"USA",a:"NRT",ac2:"Tokyo",aco:"Japan"},
      {d:"DXB",dc:"Dubai",dco:"UAE",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"DXB",dc:"Dubai",dco:"UAE",a:"SIN",ac2:"Singapore",aco:"Singapore"},
      {d:"DXB",dc:"Dubai",dco:"UAE",a:"BKK",ac2:"Bangkok",aco:"Thailand"},
      {d:"DXB",dc:"Dubai",dco:"UAE",a:"NBO",ac2:"Nairobi",aco:"Kenya"},
      {d:"SIN",dc:"Singapore",dco:"Singapore",a:"NRT",ac2:"Tokyo",aco:"Japan"},
      {d:"SIN",dc:"Singapore",dco:"Singapore",a:"SYD",ac2:"Sydney",aco:"Australia"},
      {d:"SIN",dc:"Singapore",dco:"Singapore",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"CDG",dc:"Paris",dco:"France",a:"JFK",ac2:"New York",aco:"USA"},
      {d:"CDG",dc:"Paris",dco:"France",a:"DXB",ac2:"Dubai",aco:"UAE"},
      {d:"ACC",dc:"Accra",dco:"Ghana",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"ACC",dc:"Accra",dco:"Ghana",a:"LOS",ac2:"Lagos",aco:"Nigeria"},
      {d:"ACC",dc:"Accra",dco:"Ghana",a:"JNB",ac2:"Johannesburg",aco:"South Africa"},
      {d:"LOS",dc:"Lagos",dco:"Nigeria",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"NBO",dc:"Nairobi",dco:"Kenya",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"NBO",dc:"Nairobi",dco:"Kenya",a:"DXB",ac2:"Dubai",aco:"UAE"},
      {d:"ARN",dc:"Stockholm",dco:"Sweden",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"IST",dc:"Istanbul",dco:"Turkey",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"IST",dc:"Istanbul",dco:"Turkey",a:"DXB",ac2:"Dubai",aco:"UAE"},
      {d:"CAI",dc:"Cairo",dco:"Egypt",a:"DXB",ac2:"Dubai",aco:"UAE"},
      {d:"ATL",dc:"Atlanta",dco:"USA",a:"JFK",ac2:"New York",aco:"USA"},
      {d:"ORD",dc:"Chicago",dco:"USA",a:"LAX",ac2:"Los Angeles",aco:"USA"},
      {d:"DOH",dc:"Doha",dco:"Qatar",a:"LHR",ac2:"London",aco:"United Kingdom"},
      {d:"BOM",dc:"Mumbai",dco:"India",a:"DXB",ac2:"Dubai",aco:"UAE"},
      {d:"DEL",dc:"Delhi",dco:"India",a:"SIN",ac2:"Singapore",aco:"Singapore"},
      {d:"ICN",dc:"Seoul",dco:"South Korea",a:"NRT",ac2:"Tokyo",aco:"Japan"},
      {d:"BKK",dc:"Bangkok",dco:"Thailand",a:"SIN",ac2:"Singapore",aco:"Singapore"},
      {d:"SYD",dc:"Sydney",dco:"Australia",a:"LAX",ac2:"Los Angeles",aco:"USA"},
    ];
    const times=[{h:7,m:15},{h:11,m:30},{h:16,m:45},{h:21,m:0}];
    for(let day=0;day<14;day++){
      for(const r of routes){
        for(let t=0;t<3;t++){
          const dep=new Date(now);dep.setDate(dep.getDate()+day);dep.setHours(times[t].h,times[t].m+Math.floor(Math.random()*15),0,0);
          const dur=120+Math.floor(Math.random()*600);const arr=new Date(dep.getTime()+dur*60000);const base=200+Math.floor(Math.random()*800);
          flights.push({
            flightNumber:`SX ${100+Math.floor(Math.random()*900)}`,type:"commercial",airline:"SKYLUX Airways",isActive:true,
            aircraft:ac[t%ac.length]._id,
            departure:{airport:r.dc+" International",airportCode:r.d,city:r.dc,country:r.dco,terminal:"T"+(1+Math.floor(Math.random()*3)),gate:String.fromCharCode(65+Math.floor(Math.random()*5))+(1+Math.floor(Math.random()*25)),scheduledTime:dep},
            arrival:{airport:r.ac2+" International",airportCode:r.a,city:r.ac2,country:r.aco,terminal:"T"+(1+Math.floor(Math.random()*3)),gate:String.fromCharCode(65+Math.floor(Math.random()*5))+(1+Math.floor(Math.random()*25)),scheduledTime:arr},
            duration:dur,distance:dur*8,status:"scheduled",stops:0,
            seatMap:[
              {class:"economy",price:base,availableSeats:140,totalSeats:198,rows:33,seatsPerRow:6,layout:"3-3-3"},
              {class:"premium",price:Math.round(base*1.5),availableSeats:30,totalSeats:42,rows:7,seatsPerRow:6,layout:"2-3-2"},
              {class:"business",price:Math.round(base*3),availableSeats:20,totalSeats:36,rows:9,seatsPerRow:4,layout:"1-2-1"},
              {class:"first",price:Math.round(base*5.5),availableSeats:10,totalSeats:14,rows:7,seatsPerRow:2,layout:"1-1"},
            ],
          });
        }
      }
    }
    const result=await Flight.insertMany(flights,{ordered:false});
    return NextResponse.json({success:true,inserted:result.length});
  }catch(error:any){
    return NextResponse.json({success:false,error:error.message},{status:500});
  }
}
