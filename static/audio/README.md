# Game audio

Bundled samples are from Kenney's [RPG Audio](https://kenney.nl/assets/rpg-audio) pack and are CC0 1.0 (license text: `KENNEY-RPG-AUDIO-LICENSE.txt`). `footstep04.ogg` is used for deployment/reinforcement and `knifeSlice.ogg` for attacks. The supplied pack has no suitable turn, card, victory, defeat, or conquest cue; those events are intentionally silent rather than using synthesized beeps. Continent conquest also remains silent to avoid duplicating the existing conquer-phase event. Sample playback respects the saved mute toggle and catches autoplay-policy rejections.
