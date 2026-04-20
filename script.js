// === TAB SWITCHING ===
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.textContent.toLowerCase().replace(/[^a-z0-9]/g,'').includes(name.replace(/[^a-z0-9]/g,''))) b.classList.add('active');
  });
}

// === VALUE HELPER ===
function v(id) {
  const el = document.getElementById(id);
  if (!el) return 'OFF';
  return el.value;
}

function q(val) {
  return '"' + val + '"';
}

function pad(name, val, def, comment) {
  const nameStr = '#define ' + name;
  const padded = nameStr.padEnd(42);
  const valStr = String(val).padEnd(8);
  return padded + valStr + ' // ' + def.padEnd(8) + comment;
}

// === CALCULATORS ===
function calcAxis1() {
  const ms = parseFloat(document.getElementById('calc_a1_motor_steps').value) || 0;
  const us = parseFloat(document.getElementById('calc_a1_microsteps').value) || 1;
  const worm = parseFloat(document.getElementById('calc_a1_worm').value) || 1;
  const pulley = parseFloat(document.getElementById('calc_a1_pulley').value) || 1;
  const total = ms * us * worm * pulley;
  const spd = total / 360;
  document.getElementById('calc_a1_result').value = spd.toFixed(4);
  document.getElementById('calc_a1_total').value = total.toFixed(0);
  document.getElementById('AXIS1_STEPS_PER_DEGREE').value = spd.toFixed(4);
  calcSlew();
  calcPEC();
}

function calcAxis2() {
  const ms = parseFloat(document.getElementById('calc_a2_motor_steps').value) || 0;
  const us = parseFloat(document.getElementById('calc_a2_microsteps').value) || 1;
  const worm = parseFloat(document.getElementById('calc_a2_worm').value) || 1;
  const pulley = parseFloat(document.getElementById('calc_a2_pulley').value) || 1;
  const total = ms * us * worm * pulley;
  const spd = total / 360;
  document.getElementById('calc_a2_result').value = spd.toFixed(4);
  document.getElementById('calc_a2_total').value = total.toFixed(0);
  document.getElementById('AXIS2_STEPS_PER_DEGREE').value = spd.toFixed(4);
  calcSlew();
}

function calcAxis3() {
  const cx = parseFloat(document.getElementById('calc_a3_cam_x').value) || 0;
  const cy = parseFloat(document.getElementById('calc_a3_cam_y').value) || 0;
  const diag = Math.sqrt(cx*cx + cy*cy);
  const sensorSpd = (diag * 2) / 360;
  if (document.getElementById('calc_a3_sensor')) document.getElementById('calc_a3_sensor').value = sensorSpd.toFixed(4);
  
  const ms = parseFloat(document.getElementById('calc_a3_motor_steps').value) || 0;
  const us = parseFloat(document.getElementById('calc_a3_microsteps').value) || 1;
  const gn = parseFloat(document.getElementById('calc_a3_gear_num').value) || 1;
  const gd = parseFloat(document.getElementById('calc_a3_gear_den').value) || 1;
  const mechSpd = (ms * us * (gn/gd)) / 360;
  if (document.getElementById('calc_a3_result')) document.getElementById('calc_a3_result').value = mechSpd.toFixed(4);
  if (document.getElementById('AXIS3_STEPS_PER_DEGREE')) document.getElementById('AXIS3_STEPS_PER_DEGREE').value = mechSpd.toFixed(4);
}

function calcSlew() {
  const a1spd = parseFloat(document.getElementById('AXIS1_STEPS_PER_DEGREE').value) || parseFloat(document.getElementById('calc_a1_result').value) || 0;
  const rate = parseFloat(document.getElementById('SLEW_RATE_BASE_DESIRED').value) || parseFloat(document.getElementById('calc_slew_rate').value) || 3;

  const trackingUs = parseFloat(document.getElementById('calc_a1_microsteps').value) || 32;
  const gotoUsVal = parseFloat(document.getElementById('calc_a1_goto_us').value) || 0;
  const gotoUs = gotoUsVal > 0 ? gotoUsVal : trackingUs;
  const usRatio = gotoUs / trackingUs;

  if (a1spd > 0) {
    const slewSpd = a1spd * usRatio;
    const stepsPerSec = slewSpd * rate;
    const usPerStep = 1000000 / stepsPerSec;
    const fastestUs = usPerStep / 2;
    if (document.getElementById('calc_slew_base')) document.getElementById('calc_slew_base').value = usPerStep.toFixed(1) + ' µs/step → ' + rate + '°/s';
    if (document.getElementById('calc_slew_slow')) document.getElementById('calc_slew_slow').value = (usPerStep * 2).toFixed(1) + ' µs/step → ' + (rate/2) + '°/s';
    if (document.getElementById('calc_slew_fast')) document.getElementById('calc_slew_fast').value = fastestUs.toFixed(1) + ' µs/step → ' + (rate*2) + '°/s';
  }
  const a2spd = parseFloat(document.getElementById('AXIS2_STEPS_PER_DEGREE').value) || parseFloat(document.getElementById('calc_a2_result').value) || 0;
  if (a1spd > 0 && document.getElementById('calc_track_res1')) document.getElementById('calc_track_res1').value = (3600 / a1spd).toFixed(4) + '"';
  if (a2spd > 0 && document.getElementById('calc_track_res2')) document.getElementById('calc_track_res2').value = (3600 / a2spd).toFixed(4) + '"';
}

function calcPEC() {
  const worm = parseFloat(document.getElementById('calc_a1_worm').value) || 0;
  const a1spd = parseFloat(document.getElementById('AXIS1_STEPS_PER_DEGREE').value) || parseFloat(document.getElementById('calc_a1_result').value) || 0;
  if (document.getElementById('calc_pec_worm')) document.getElementById('calc_pec_worm').value = worm;
  if (worm > 0 && a1spd > 0 && document.getElementById('calc_pec_result')) {
    const pec = (a1spd * 360) / worm;
    document.getElementById('calc_pec_result').value = pec.toFixed(2);
  }
  if (document.getElementById('PEC_STEPS_PER_WORM_ROTATION') && worm > 0 && a1spd > 0) {
    const pec = (a1spd * 360) / worm;
    document.getElementById('PEC_STEPS_PER_WORM_ROTATION').value = pec.toFixed(2);
  }
}

// === AUXILIARY FEATURES GENERATOR ===
function buildFeatures() {
  const container = document.getElementById('features-container');
  if (!container) return;
  const defaults = [
    {n:1, purpose:'OFF', name:'FEATURE1', pin:'OFF', onState:'HIGH'},
    {n:2, purpose:'OFF', name:'FEATURE2', pin:'OFF', onState:'HIGH'},
    {n:3, purpose:'OFF', name:'FEATURE3', pin:'OFF', onState:'HIGH'},
    {n:4, purpose:'OFF', name:'FEATURE4', pin:'OFF', onState:'HIGH'},
    {n:5, purpose:'OFF', name:'FEATURE5', pin:'OFF', onState:'HIGH'},
    {n:6, purpose:'OFF', name:'FEATURE6', pin:'OFF', onState:'HIGH'},
    {n:7, purpose:'OFF', name:'FEATURE7', pin:'OFF', onState:'HIGH'},
    {n:8, purpose:'INTERVALOMETER', name:'CANON 20D', pin:'AUX', onState:'HIGH'},
  ];
  let html = '';
  for (const f of defaults) {
    const n = f.n;
    html += `<div class="section">
      <div class="section-title">Feature ${n}</div>
      <div class="field-row">
        <label class="field-label">FEATURE${n}_PURPOSE</label>
        <select id="FEATURE${n}_PURPOSE">
          <option value="OFF" ${f.purpose === 'OFF' ? 'selected' : ''}>OFF</option>
          <option value="SWITCH" ${f.purpose === 'SWITCH' ? 'selected' : ''}>SWITCH</option>
          <option value="MOMENTARY_SWITCH">MOMENTARY_SWITCH</option>
          <option value="ANALOG_OUT">ANALOG_OUT</option>
          <option value="DEW_HEATER">DEW_HEATER</option>
          <option value="INTERVALOMETER" ${f.purpose === 'INTERVALOMETER' ? 'selected' : ''}>INTERVALOMETER</option>
        </select>
        <span class="field-hint">Feature purpose</span>
      </div>
      <div class="field-row">
        <label class="field-label">FEATURE${n}_NAME</label>
        <input type="text" id="FEATURE${n}_NAME" value="${f.name}">
        <span class="field-hint">Display name</span>
      </div>
      <div class="field-row">
        <label class="field-label">FEATURE${n}_TEMP</label>
        <input type="text" id="FEATURE${n}_TEMP" value="OFF">
        <span class="field-hint">OFF, THERMISTOR, or DS18B20 s/n</span>
      </div>
      <div class="field-row">
        <label class="field-label">FEATURE${n}_PIN</label>
        <input type="text" id="FEATURE${n}_PIN" value="${f.pin}">
        <span class="field-hint">OFF, AUX, or pin number</span>
      </div>
      <div class="field-row">
        <label class="field-label">FEATURE${n}_VALUE_DEFAULT</label>
        <input type="text" id="FEATURE${n}_VALUE_DEFAULT" value="OFF">
        <span class="field-hint">OFF, ON, or 0..255</span>
      </div>
      <div class="field-row">
        <label class="field-label">FEATURE${n}_VALUE_MEMORY</label>
        <select id="FEATURE${n}_VALUE_MEMORY"><option value="OFF" selected>OFF</option><option value="ON">ON</option></select>
        <span class="field-hint">Remember across power cycles</span>
      </div>
      <div class="field-row">
        <label class="field-label">FEATURE${n}_ON_STATE</label>
        <select id="FEATURE${n}_ON_STATE"><option value="HIGH" ${f.onState === 'HIGH' ? 'selected' : ''}>HIGH</option><option value="LOW">LOW</option></select>
        <span class="field-hint">ON state voltage level</span>
      </div>
    </div>`;
  }
  container.innerHTML = html;
}

// === COMPREHENSIVE CONFIG GENERATION ===
function generateConfig() {
  let c = '';
  const L = (s) => { c += s + '\n'; };

  L('/* ---------------------------------------------------------------------------------------------------------------------------------');
  L(' * Configuration for OnStepX');
  L(' *');
  L(' *          For more information on setting OnStep up see http://www.stellarjourney.com/index.php?r=site/equipment_onstep');
  L(' *                      and join the OnStep Groups.io at https://groups.io/g/onstep');
  L(' *');
  L(' *           *** Read the compiler warnings and errors, they are there to help guard against invalid configurations ***');
  L(' *');
  L(' * ---------------------------------------------------------------------------------------------------------------------------------');
  L(' * ADJUST THE FOLLOWING TO CONFIGURE YOUR CONTROLLER FEATURES');
  L(' * ---------------------------------------------------------------------------------------------------------------------------------');
  L('*/');
  L('');

  // CONTROLLER SECTION
  L('// =================================================================================================================================');
  L('// CONTROLLER ======================================================================================================================');
  L('');
  L(pad('HOST_NAME', q(v('HOST_NAME')), q('nStep'), 'Hostname for this device'));
  L('');
  L(pad('PINMAP', v('PINMAP'), 'OFF,', 'Board selection'));
  L('');
  
  // SERIAL PORTS
  L('// SERIAL PORTS');
  L(pad('SERIAL_A_BAUD_DEFAULT', v('SERIAL_A_BAUD_DEFAULT'), '9600,', 'Serial A baud rate'));
  L(pad('SERIAL_B_BAUD_DEFAULT', v('SERIAL_B_BAUD_DEFAULT'), '9600,', 'Serial B baud rate'));
  L(pad('SERIAL_B_ESP_FLASHING', v('SERIAL_B_ESP_FLASHING'), 'OFF,', 'ESP8266 flashing via Serial B'));
  L(pad('SERIAL_C_BAUD_DEFAULT', v('SERIAL_C_BAUD_DEFAULT'), 'OFF,', 'Serial C baud rate'));
  L(pad('SERIAL_D_BAUD_DEFAULT', v('SERIAL_D_BAUD_DEFAULT'), 'OFF,', 'Serial D baud rate'));
  L(pad('SERIAL_E_BAUD_DEFAULT', v('SERIAL_E_BAUD_DEFAULT'), 'OFF,', 'Serial E baud rate'));
  L(pad('SERIAL_RADIO', v('SERIAL_RADIO'), 'OFF,', 'Wireless mode (ESP32)'));
  L('');
  
  // STATUS & MISC
  L('// STATUS & MISC');
  L(pad('STATUS_LED', v('STATUS_LED'), 'OFF,', 'Status LED on controller'));
  L(pad('RETICLE_LED_DEFAULT', v('RETICLE_LED_DEFAULT'), 'OFF,', 'Reticle LED brightness'));
  L(pad('RETICLE_LED_MEMORY', v('RETICLE_LED_MEMORY'), 'OFF,', 'Remember reticle brightness'));
  L(pad('RETICLE_LED_INVERT', v('RETICLE_LED_INVERT'), 'OFF,', 'Invert reticle control'));
  L(pad('WEATHER', v('WEATHER'), 'OFF,', 'Weather sensor type'));
  L(pad('STEP_WAVE_FORM', v('STEP_WAVE_FORM'), 'SQUARE,', 'Step signal waveform'));
  L(pad('NV_DRIVER', v('NV_DRIVER'), 'NV_DEF,', 'Non-volatile memory driver'));
  L('');

  // MOUNT SECTION
  L('// =================================================================================================================================');
  L('// MOUNT ===========================================================================================================================');
  L('');
  
  // AXIS1
  L('// AXIS1 RA/AZIMUTH');
  L(pad('AXIS1_DRIVER_MODEL', v('AXIS1_DRIVER_MODEL'), 'OFF,', 'Motor driver model'));
  L(pad('AXIS1_STEPS_PER_DEGREE', v('AXIS1_STEPS_PER_DEGREE'), '12800,', 'Steps per degree'));
  L(pad('AXIS1_REVERSE', v('AXIS1_REVERSE'), 'OFF,', 'Reverse movement direction'));
  L(pad('AXIS1_LIMIT_MIN', v('AXIS1_LIMIT_MIN'), '-180,', 'Minimum Hour Angle/Azimuth'));
  L(pad('AXIS1_LIMIT_MAX', v('AXIS1_LIMIT_MAX'), '180,', 'Maximum Hour Angle/Azimuth'));
  L(pad('AXIS1_LIMIT_SYNC', v('AXIS1_LIMIT_SYNC'), 'OFF,', 'Sync range limit'));
  L('');
  
  L('// AXIS1 MICROSTEPS & CURRENT');
  L(pad('AXIS1_DRIVER_MICROSTEPS', v('AXIS1_DRIVER_MICROSTEPS'), 'OFF,', 'Microstep mode tracking'));
  L(pad('AXIS1_DRIVER_MICROSTEPS_GOTO', v('AXIS1_DRIVER_MICROSTEPS_GOTO'), 'OFF,', 'Microstep mode slewing'));
  L(pad('AXIS1_DRIVER_IHOLD', v('AXIS1_DRIVER_IHOLD'), 'OFF,', 'Standstill current (mA)'));
  L(pad('AXIS1_DRIVER_IRUN', v('AXIS1_DRIVER_IRUN'), 'OFF,', 'Tracking current (mA)'));
  L(pad('AXIS1_DRIVER_IGOTO', v('AXIS1_DRIVER_IGOTO'), 'OFF,', 'Slew current (mA)'));
  L('');
  
  L('// AXIS1 ADVANCED');
  L(pad('AXIS1_DRIVER_STATUS', v('AXIS1_DRIVER_STATUS'), 'OFF,', 'Driver status detection'));
  L(pad('AXIS1_DRIVER_DECAY', v('AXIS1_DRIVER_DECAY'), 'OFF,', 'Tracking decay override'));
  L(pad('AXIS1_DRIVER_DECAY_GOTO', v('AXIS1_DRIVER_DECAY_GOTO'), 'OFF,', 'Goto decay override'));
  L(pad('AXIS1_POWER_DOWN', v('AXIS1_POWER_DOWN'), 'OFF,', 'Power down after stop'));
  L(pad('AXIS1_SENSE_HOME', v('AXIS1_SENSE_HOME'), 'OFF,', 'Home position sense'));
  L(pad('AXIS1_SENSE_LIMIT_MIN', v('AXIS1_SENSE_LIMIT_MIN'), '...NSE,', 'Min limit switch'));
  L(pad('AXIS1_SENSE_LIMIT_MAX', v('AXIS1_SENSE_LIMIT_MAX'), '...NSE,', 'Max limit switch'));
  L('');

  // AXIS2
  L('// AXIS2 DEC/ALTITUDE');
  L(pad('AXIS2_DRIVER_MODEL', v('AXIS2_DRIVER_MODEL'), 'OFF,', 'Motor driver model'));
  L(pad('AXIS2_STEPS_PER_DEGREE', v('AXIS2_STEPS_PER_DEGREE'), '12800,', 'Steps per degree'));
  L(pad('AXIS2_REVERSE', v('AXIS2_REVERSE'), 'OFF,', 'Reverse movement direction'));
  L(pad('AXIS2_LIMIT_MIN', v('AXIS2_LIMIT_MIN'), '-90,', 'Minimum Declination/Altitude'));
  L(pad('AXIS2_LIMIT_MAX', v('AXIS2_LIMIT_MAX'), '90,', 'Maximum Declination/Altitude'));
  L(pad('AXIS2_LIMIT_SYNC', v('AXIS2_LIMIT_SYNC'), 'OFF,', 'Sync range limit'));
  L('');
  
  L('// AXIS2 MICROSTEPS & CURRENT');
  L(pad('AXIS2_DRIVER_MICROSTEPS', v('AXIS2_DRIVER_MICROSTEPS'), 'OFF,', 'Microstep mode tracking'));
  L(pad('AXIS2_DRIVER_MICROSTEPS_GOTO', v('AXIS2_DRIVER_MICROSTEPS_GOTO'), 'OFF,', 'Microstep mode slewing'));
  L(pad('AXIS2_DRIVER_IHOLD', v('AXIS2_DRIVER_IHOLD'), 'OFF,', 'Standstill current (mA)'));
  L(pad('AXIS2_DRIVER_IRUN', v('AXIS2_DRIVER_IRUN'), 'OFF,', 'Tracking current (mA)'));
  L(pad('AXIS2_DRIVER_IGOTO', v('AXIS2_DRIVER_IGOTO'), 'OFF,', 'Slew current (mA)'));
  L('');
  
  L('// AXIS2 ADVANCED');
  L(pad('AXIS2_DRIVER_STATUS', v('AXIS2_DRIVER_STATUS'), 'OFF,', 'Driver status detection'));
  L(pad('AXIS2_DRIVER_DECAY', v('AXIS2_DRIVER_DECAY'), 'OFF,', 'Tracking decay override'));
  L(pad('AXIS2_DRIVER_DECAY_GOTO', v('AXIS2_DRIVER_DECAY_GOTO'), 'OFF,', 'Goto decay override'));
  L(pad('AXIS2_POWER_DOWN', v('AXIS2_POWER_DOWN'), 'OFF,', 'Power down after stop'));
  L(pad('AXIS2_SENSE_HOME', v('AXIS2_SENSE_HOME'), 'OFF,', 'Home position sense'));
  L(pad('AXIS2_SENSE_LIMIT_MIN', v('AXIS2_SENSE_LIMIT_MIN'), '...NSE,', 'Min limit switch'));
  L(pad('AXIS2_SENSE_LIMIT_MAX', v('AXIS2_SENSE_LIMIT_MAX'), '...NSE,', 'Max limit switch'));
  L('');

  // MOUNT
  L('// MOUNT');
  L(pad('MOUNT_TYPE', v('MOUNT_TYPE'), 'GEM,', 'Mount type'));
  L(pad('MOUNT_ALTERNATE_ORIENTATION', v('MOUNT_ALTERNATE_ORIENTATION'), 'OFF,', 'Meridian flip for FORK'));
  L(pad('MOUNT_STARTUP_MODE', v('MOUNT_STARTUP_MODE'), '..AUTO,', 'Startup trust mode'));
  L(pad('MOUNT_COORDS', v('MOUNT_COORDS'), '...RIC,', 'Refraction correction'));
  L(pad('MOUNT_COORDS_MEMORY', v('MOUNT_COORDS_MEMORY'), 'OFF,', 'Remember coordinates'));
  L(pad('MOUNT_ENABLE_IN_STANDBY', v('MOUNT_ENABLE_IN_STANDBY'), 'OFF,', 'Enable drivers in standby'));
  L('');

  // TIME & LOCATION
  L('// TIME & LOCATION');
  L(pad('TIME_LOCATION_SOURCE', v('TIME_LOCATION_SOURCE'), 'OFF,', 'Date/Time source'));
  L(pad('TIME_LOCATION_PPS_SENSE', v('TIME_LOCATION_PPS_SENSE'), 'OFF,', 'PPS signal edge'));
  L('');

  // STATUS (MOUNT)
  L('// STATUS');
  L(pad('STATUS_MOUNT_LED', v('STATUS_MOUNT_LED'), 'OFF,', 'Movement rate LED'));
  L(pad('STATUS_BUZZER', v('STATUS_BUZZER'), 'OFF,', 'Buzzer control'));
  L(pad('STATUS_BUZZER_DEFAULT', v('STATUS_BUZZER_DEFAULT'), 'OFF,', 'Start with buzzer enabled'));
  L(pad('STATUS_BUZZER_MEMORY', v('STATUS_BUZZER_MEMORY'), 'OFF,', 'Remember buzzer setting'));
  L('');

  // ST4 INTERFACE
  L('// ST4 INTERFACE');
  L(pad('ST4_INTERFACE', v('ST4_INTERFACE'), 'OFF,', 'ST4 guide interface'));
  L(pad('ST4_HAND_CONTROL', v('ST4_HAND_CONTROL'), 'ON,', 'Hand controller features'));
  L(pad('ST4_HAND_CONTROL_FOCUSER', v('ST4_HAND_CONTROL_FOCUSER'), 'ON,', 'Focuser via hand controller'));
  L('');

  // GUIDING
  L('// GUIDING');
  L(pad('GUIDE_TIME_LIMIT', v('GUIDE_TIME_LIMIT'), '0,', 'Guide time limit (seconds)'));
  L(pad('GUIDE_DISABLE_BACKLASH', v('GUIDE_DISABLE_BACKLASH'), 'OFF,', 'Disable backlash during guide'));
  L('');

  // LIMITS
  L('// LIMITS');
  L(pad('LIMIT_SENSE', v('LIMIT_SENSE'), 'OFF,', 'Limit switch state'));
  L(pad('LIMIT_STRICT', v('LIMIT_STRICT'), 'OFF,', 'Enable limits at startup'));
  L('');

  // PARKING
  L('// PARKING');
  L(pad('PARK_SENSE', v('PARK_SENSE'), 'OFF,', 'Park orientation sensor'));
  L(pad('PARK_SIGNAL', v('PARK_SIGNAL'), 'OFF,', 'Park input signal'));
  L(pad('PARK_STATUS', v('PARK_STATUS'), 'OFF,', 'Park status output'));
  L('');

  // PEC
  L('// PEC');
  L(pad('PEC_STEPS_PER_WORM_ROTATION', v('PEC_STEPS_PER_WORM_ROTATION'), '0,', 'Steps per worm rotation'));
  L(pad('PEC_SENSE', v('PEC_SENSE'), 'OFF,', 'PEC sensor edge'));
  L(pad('PEC_BUFFER_SIZE_LIMIT', v('PEC_BUFFER_SIZE_LIMIT'), '720,', 'PEC buffer size (seconds)'));
  L('');

  // TRACKING
  L('// TRACKING BEHAVIOUR');
  L(pad('TRACK_BACKLASH_RATE', v('TRACK_BACKLASH_RATE'), '20,', 'Backlash rate (x sidereal)'));
  L(pad('TRACK_AUTOSTART', v('TRACK_AUTOSTART'), 'OFF,', 'Start with tracking enabled'));
  L(pad('TRACK_COMPENSATION_DEFAULT', v('TRACK_COMPENSATION_DEFAULT'), 'OFF,', 'Tracking compensation'));
  L(pad('TRACK_COMPENSATION_MEMORY', v('TRACK_COMPENSATION_MEMORY'), 'OFF,', 'Remember compensation'));
  L('');

  // SLEWING
  L('// SLEWING BEHAVIOUR');
  L(pad('SLEW_RATE_BASE_DESIRED', v('SLEW_RATE_BASE_DESIRED'), '1.0,', 'Base slew rate (deg/sec)'));
  L(pad('SLEW_RATE_MEMORY', v('SLEW_RATE_MEMORY'), 'OFF,', 'Remember slew rate'));
  L(pad('SLEW_ACCELERATION_DIST', v('SLEW_ACCELERATION_DIST'), '5.0,', 'Acceleration distance (deg)'));
  L(pad('SLEW_RAPID_STOP_DIST', v('SLEW_RAPID_STOP_DIST'), '2.0,', 'Stop distance (deg)'));
  L(pad('GOTO_FEATURE', v('GOTO_FEATURE'), 'ON,', 'Enable Goto features'));
  L(pad('GOTO_OFFSET', v('GOTO_OFFSET'), '0.25,', 'Goto offset (deg)'));
  L(pad('GOTO_OFFSET_ALIGN', v('GOTO_OFFSET_ALIGN'), 'OFF,', 'Skip final phase for align'));
  L('');

  // PIER SIDE
  L('// PIER SIDE');
  L(pad('MFLIP_SKIP_HOME', v('MFLIP_SKIP_HOME'), 'OFF,', 'Skip home during flip'));
  L(pad('MFLIP_AUTOMATIC_DEFAULT', v('MFLIP_AUTOMATIC_DEFAULT'), 'OFF,', 'Auto meridian flips'));
  L(pad('MFLIP_AUTOMATIC_MEMORY', v('MFLIP_AUTOMATIC_MEMORY'), 'OFF,', 'Remember meridian flip'));
  L(pad('MFLIP_PAUSE_HOME_DEFAULT', v('MFLIP_PAUSE_HOME_DEFAULT'), 'OFF,', 'Pause at home during flip'));
  L(pad('MFLIP_PAUSE_HOME_MEMORY', v('MFLIP_PAUSE_HOME_MEMORY'), 'OFF,', 'Remember pause setting'));
  L(pad('PIER_SIDE_SYNC_CHANGE_SIDES', v('PIER_SIDE_SYNC_CHANGE_SIDES'), 'OFF,', 'Sync can change pier side'));
  L(pad('PIER_SIDE_PREFERRED_DEFAULT', v('PIER_SIDE_PREFERRED_DEFAULT'), 'BEST,', 'Preferred pier side'));
  L(pad('PIER_SIDE_PREFERRED_MEMORY', v('PIER_SIDE_PREFERRED_MEMORY'), 'OFF,', 'Remember pier side'));
  L('');

  // ALIGN
  L('// ALIGNMENT');
  L(pad('ALIGN_AUTO_HOME', v('ALIGN_AUTO_HOME'), 'OFF,', 'Auto home for alignment'));
  L(pad('ALIGN_MODEL_MEMORY', v('ALIGN_MODEL_MEMORY'), 'OFF,', 'Restore pointing model'));
  L(pad('ALIGN_MAX_STARS', v('ALIGN_MAX_STARS'), 'AUTO,', 'Max alignment stars'));
  L('');

  // ROTATOR SECTION
  L('// =================================================================================================================================');
  L('// ROTATOR =========================================================================================================================');
  L('');
  L('// AXIS3 ROTATOR');
  L(pad('AXIS3_DRIVER_MODEL', v('AXIS3_DRIVER_MODEL'), 'OFF,', 'Motor driver model'));
  L(pad('AXIS3_SLEW_RATE_BASE_DESIRED', v('AXIS3_SLEW_RATE_BASE_DESIRED'), '1.0,', 'Base slew rate (deg/sec)'));
  L(pad('AXIS3_STEPS_PER_DEGREE', v('AXIS3_STEPS_PER_DEGREE'), '64.0,', 'Steps per degree'));
  L(pad('AXIS3_REVERSE', v('AXIS3_REVERSE'), 'OFF,', 'Reverse direction'));
  L(pad('AXIS3_LIMIT_MIN', v('AXIS3_LIMIT_MIN'), '0,', 'Minimum angle (deg)'));
  L(pad('AXIS3_LIMIT_MAX', v('AXIS3_LIMIT_MAX'), '360,', 'Maximum angle (deg)'));
  L(pad('AXIS3_DRIVER_MICROSTEPS', v('AXIS3_DRIVER_MICROSTEPS'), 'OFF,', 'Microstep mode'));
  L(pad('AXIS3_DRIVER_MICROSTEPS_GOTO', v('AXIS3_DRIVER_MICROSTEPS_GOTO'), 'OFF,', 'Microstep goto mode'));
  L(pad('AXIS3_DRIVER_IHOLD', v('AXIS3_DRIVER_IHOLD'), 'OFF,', 'Standstill current (mA)'));
  L(pad('AXIS3_DRIVER_IRUN', v('AXIS3_DRIVER_IRUN'), 'OFF,', 'Tracking current (mA)'));
  L(pad('AXIS3_DRIVER_IGOTO', v('AXIS3_DRIVER_IGOTO'), 'OFF,', 'Slew current (mA)'));
  L(pad('AXIS3_DRIVER_STATUS', v('AXIS3_DRIVER_STATUS'), 'OFF,', 'Status detection'));
  L(pad('AXIS3_DRIVER_DECAY', v('AXIS3_DRIVER_DECAY'), 'OFF,', 'Decay override'));
  L(pad('AXIS3_DRIVER_DECAY_GOTO', v('AXIS3_DRIVER_DECAY_GOTO'), 'OFF,', 'Decay goto override'));
  L(pad('AXIS3_POWER_DOWN', v('AXIS3_POWER_DOWN'), 'OFF,', 'Power down after stop'));
  L(pad('AXIS3_SENSE_HOME', v('AXIS3_SENSE_HOME'), 'OFF,', 'Home sense'));
  L(pad('AXIS3_SENSE_LIMIT_MIN', v('AXIS3_SENSE_LIMIT_MIN'), 'OFF,', 'Min limit'));
  L(pad('AXIS3_SENSE_LIMIT_MAX', v('AXIS3_SENSE_LIMIT_MAX'), 'OFF,', 'Max limit'));
  L('');

  // FOCUSER SECTION
  L('// =================================================================================================================================');
  L('// FOCUSER =========================================================================================================================');
  L('');
  L('// AXIS4 FOCUSER');
  L(pad('AXIS4_DRIVER_MODEL', v('AXIS4_DRIVER_MODEL'), 'OFF,', 'Motor driver model'));
  L(pad('AXIS4_SLEW_RATE_BASE_DESIRED', v('AXIS4_SLEW_RATE_BASE_DESIRED'), '500,', 'Slew rate (µm/s)'));
  L(pad('AXIS4_SLEW_RATE_MINIMUM', v('AXIS4_SLEW_RATE_MINIMUM'), '20,', 'Minimum slew rate (µm/s)'));
  L(pad('AXIS4_STEPS_PER_MICRON', v('AXIS4_STEPS_PER_MICRON'), '0.5,', 'Steps per micrometer'));
  L(pad('AXIS4_REVERSE', v('AXIS4_REVERSE'), 'OFF,', 'Reverse direction'));
  L(pad('AXIS4_LIMIT_MIN', v('AXIS4_LIMIT_MIN'), '0,', 'Minimum position (mm)'));
  L(pad('AXIS4_LIMIT_MAX', v('AXIS4_LIMIT_MAX'), '50,', 'Maximum position (mm)'));
  L(pad('AXIS4_DRIVER_MICROSTEPS', v('AXIS4_DRIVER_MICROSTEPS'), 'OFF,', 'Microstep mode'));
  L(pad('AXIS4_DRIVER_MICROSTEPS_GOTO', v('AXIS4_DRIVER_MICROSTEPS_GOTO'), 'OFF,', 'Microstep goto mode'));
  L(pad('AXIS4_DRIVER_IHOLD', v('AXIS4_DRIVER_IHOLD'), 'OFF,', 'Standstill current (mA)'));
  L(pad('AXIS4_DRIVER_IRUN', v('AXIS4_DRIVER_IRUN'), 'OFF,', 'Tracking current (mA)'));
  L(pad('AXIS4_DRIVER_IGOTO', v('AXIS4_DRIVER_IGOTO'), 'OFF,', 'Slew current (mA)'));
  L(pad('AXIS4_DRIVER_STATUS', v('AXIS4_DRIVER_STATUS'), 'OFF,', 'Status detection'));
  L(pad('AXIS4_DRIVER_DECAY', v('AXIS4_DRIVER_DECAY'), 'OFF,', 'Decay override'));
  L(pad('AXIS4_DRIVER_DECAY_GOTO', v('AXIS4_DRIVER_DECAY_GOTO'), 'OFF,', 'Decay goto override'));
  L(pad('AXIS4_POWER_DOWN', v('AXIS4_POWER_DOWN'), 'OFF,', 'Power down after stop'));
  L(pad('AXIS4_SENSE_HOME', v('AXIS4_SENSE_HOME'), 'OFF,', 'Home sense'));
  L(pad('AXIS4_SENSE_LIMIT_MIN', v('AXIS4_SENSE_LIMIT_MIN'), 'OFF,', 'Min limit'));
  L(pad('AXIS4_SENSE_LIMIT_MAX', v('AXIS4_SENSE_LIMIT_MAX'), 'OFF,', 'Max limit'));
  L(pad('FOCUSER_TEMPERATURE', v('FOCUSER_TEMPERATURE'), 'OFF,', 'Temperature sensor'));
  L('');

  // AUXILIARY FEATURES
  L('// =================================================================================================================================');
  L('// AUXILIARY FEATURES ==============================================================================================================');
  L('');
  for (let n = 1; n <= 8; n++) {
    L('// FEATURE ' + n);
    L(pad('FEATURE'+n+'_PURPOSE', v('FEATURE'+n+'_PURPOSE'), 'OFF,', 'Feature purpose'));
    L(pad('FEATURE'+n+'_NAME', q(v('FEATURE'+n+'_NAME')), '"FE..",', 'Feature name'));
    L(pad('FEATURE'+n+'_TEMP', v('FEATURE'+n+'_TEMP'), 'OFF,', 'Temperature sensor'));
    L(pad('FEATURE'+n+'_PIN', v('FEATURE'+n+'_PIN'), 'OFF,', 'Pin assignment'));
    L(pad('FEATURE'+n+'_VALUE_DEFAULT', v('FEATURE'+n+'_VALUE_DEFAULT'), 'OFF,', 'Default value'));
    L(pad('FEATURE'+n+'_VALUE_MEMORY', v('FEATURE'+n+'_VALUE_MEMORY'), 'OFF,', 'Remember setting'));
    L(pad('FEATURE'+n+'_ON_STATE', v('FEATURE'+n+'_ON_STATE'), 'HIGH,', 'ON state level'));
    L('');
  }

  L('// ---------------------------------------------------------------------------------------------------------------------------------');
  L('#define FileVersionConfig 6');
  L('#include "Extended.config.h"');

  return c;
}

function generateExtendedConfigFile() {
  return `
/* ---------------------------------------------------------------------------------------------------------------------------------
 * Extended configuration for OnStepX - Generated by OnStepX-Builder
 * --------------------------------------------------------------------------------------------------------------------------------- */
#define DEBUG OFF
`;
}

function copyConfig() {
  const output = document.getElementById('configOutput');
  if (!output.value) generateConfig();
  navigator.clipboard.writeText(output.value).then(() => {
    showStatus('Copied to clipboard!');
  });
}

function downloadConfig() {
  const output = document.getElementById('configOutput');
  if (!output.value) generateConfig();
  const blob = new Blob([output.value], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Config.h';
  a.click();
  URL.revokeObjectURL(url);
  showStatus('Config.h downloaded!');
}

function loadConfig(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split('\n');
    for (const line of lines) {
      const m = line.match(/^#define\s+(\w+)\s+(.+?)(?:\s*\/\/.*)?$/);
      if (m) {
        const name = m[1];
        let val = m[2].trim();
        const strMatch = val.match(/^"(.*)"$/);
        if (strMatch) val = strMatch[1];
        const el = document.getElementById(name);
        if (el) {
          el.value = val;
        }
      }
    }
    showStatus('Config.h loaded! Values populated from file.');
  };
  reader.readAsText(file);
}

function showStatus(msg) {
  const bar = document.getElementById('statusBar');
  bar.textContent = msg;
  bar.classList.add('show');
  setTimeout(() => bar.classList.remove('show'), 3000);
}

// === BUILD TRIGGER WITH NETLIFY INTEGRATION ===
async function triggerBuild() {
  const statusDiv = document.getElementById('statusBar');
  statusDiv.textContent = 'Generating configuration and starting build...';
  statusDiv.classList.add('show');

  const configFileContent = generateConfig();
  const extendedConfigOutput = document.getElementById('extendedConfigOutput');
  let extendedConfigFileContent = extendedConfigOutput.value;
  
  if (!extendedConfigFileContent || extendedConfigFileContent.trim() === '') {
    extendedConfigFileContent = generateExtendedConfigFile();
  }

  try {
    const response = await fetch('/.netlify/functions/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configFileContent: btoa(configFileContent),
        extendedConfigFileContent: btoa(extendedConfigFileContent)
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Build trigger failed');
    }

    statusDiv.innerHTML = '<strong>✓ Build started successfully!</strong> <a href="https://github.com/rchadgray/OnStepX_Platformio/actions" target="_blank">View Progress</a>';
  } catch (error) {
    statusDiv.innerHTML = '<strong>Error:</strong> ' + error.message;
  }
}

// === EXTENDED CONFIG FUNCTIONS ===
function copyExtended() {
  const extendedConfigOutput = document.getElementById('extendedConfigOutput');
  extendedConfigOutput.select();
  document.execCommand('copy');
  alert('Extended Config copied to clipboard!');
}

function downloadExtended() {
  const extendedConfigOutput = document.getElementById('extendedConfigOutput');
  const content = extendedConfigOutput.value || generateExtendedConfigFile();
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Extended.config.h';
  link.click();
  URL.revokeObjectURL(url);
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  buildFeatures();
  if (document.getElementById('calc_a1_motor_steps')) calcAxis1();
  if (document.getElementById('calc_a2_motor_steps')) calcAxis2();
  if (document.getElementById('calc_a3_cam_x')) calcAxis3();
  calcSlew();
  calcPEC();

  // Attach generate button
  const generateBtn = document.querySelector('.btn-generate');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const output = document.getElementById('configOutput');
      output.value = generateConfig();
      showStatus('Config.h generated!');
      showTab('output');
    });
  }
});
