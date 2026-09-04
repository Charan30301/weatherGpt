export default function TermsPage() {
  return (
    <main className="app-background min-h-screen px-5 py-10">
      <div className="max-w-4xl mx-auto rounded-3xl bg-slate-950/80 border border-slate-700 p-8">

        <h1 className="text-3xl font-bold text-white mb-6">
          WeatherGPT Terms & Conditions
        </h1>

        <div className="space-y-6 text-slate-300">

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              1. Weather Information
            </h2>

            <p>
              WeatherGPT provides weather, environmental and
              disaster-related information from third-party data
              services. Information should not be considered a
              guarantee of future conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              2. Location Permission
            </h2>

            <p>
              WeatherGPT may request your device location to provide
              location-based weather information. You can deny or
              revoke location permission through your browser or
              device settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              3. Notifications
            </h2>

            <p>
              Notifications may be used to communicate severe weather
              and disaster warnings when notification permission has
              been granted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              4. Warning Alerts
            </h2>

            <p>
              Warning information may use weather and satellite data.
              Users should always follow official instructions from
              government and emergency authorities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              5. Third-Party Data
            </h2>

            <p>
              WeatherGPT may use services such as Open-Meteo,
              NASA FIRMS, NASA GIBS, Sentinel data and other
              authorized services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              6. Permission Control
            </h2>

            <p>
              Users can manage notification, location and warning
              preferences through WeatherGPT Settings.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}
