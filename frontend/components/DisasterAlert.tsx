interface Alert {

  type: string;

  severity: string;

  date: string;

  message: string;

}


export default function DisasterAlert({

  alert,

}: {

  alert: Alert;

}) {


  const iconMap: Record<string, string> = {

    "Heavy Rain": "🌧️",

    "Strong Wind": "🌪️",

    "Heatwave": "🔥",

  };


  return (

    <div className="
      bg-red-500/10
      border border-red-500/30
      rounded-2xl
      p-5
    ">

      <div className="
        flex
        justify-between
        items-start
      ">

        <div>

          <div className="flex gap-3">

            <span className="text-3xl">

              {iconMap[alert.type] || "⚠️"}

            </span>


            <div>

              <h3 className="font-bold">

                {alert.type}

              </h3>


              <p className="
                text-xs
                text-red-300
                mt-1
              ">

                {alert.severity} RISK

              </p>

            </div>

          </div>


          <p className="
            text-sm
            text-slate-300
            mt-4
          ">

            {alert.message}

          </p>


          <p className="
            text-xs
            text-slate-500
            mt-3
          ">

            Expected: {alert.date}

          </p>

        </div>

      </div>

    </div>

  );
}

