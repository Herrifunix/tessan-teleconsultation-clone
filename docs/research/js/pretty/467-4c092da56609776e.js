(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [467],
  {
    2374: () => {},
    2785: (e, t, r) => {
      "use strict";
      r.d(t, {
        AB: () => c,
        J5: () => i,
        Qp: () => a,
        tH: () => g,
        tJ: () => d,
        w1: () => u,
      });
      var l = r(5155);
      r(2115);
      var o = r(6673),
        n = r(7937),
        s = r(4269);
      function a(e) {
        let { ...t } = e;
        return (0, l.jsx)("nav", {
          "aria-label": "breadcrumb",
          "data-slot": "breadcrumb",
          ...t,
        });
      }
      function c(e) {
        let { className: t, ...r } = e;
        return (0, l.jsx)("ol", {
          "data-slot": "breadcrumb-list",
          className: (0, s.cn)(
            "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
            t,
          ),
          ...r,
        });
      }
      function i(e) {
        let { className: t, ...r } = e;
        return (0, l.jsx)("li", {
          "data-slot": "breadcrumb-item",
          className: (0, s.cn)("inline-flex items-center gap-1.5", t),
          ...r,
        });
      }
      function u(e) {
        let { asChild: t, className: r, ...n } = e,
          a = t ? o.DX : "a";
        return (0, l.jsx)(a, {
          "data-slot": "breadcrumb-link",
          className: (0, s.cn)("hover:text-foreground transition-colors", r),
          ...n,
        });
      }
      function d(e) {
        let { className: t, ...r } = e;
        return (0, l.jsx)("span", {
          "data-slot": "breadcrumb-page",
          role: "link",
          "aria-disabled": "true",
          "aria-current": "page",
          className: (0, s.cn)("text-foreground font-normal", t),
          ...r,
        });
      }
      function g(e) {
        let { children: t, className: r, ...o } = e;
        return (0, l.jsx)("li", {
          "data-slot": "breadcrumb-separator",
          role: "presentation",
          "aria-hidden": "true",
          className: (0, s.cn)("[&>svg]:size-3.5", r),
          ...o,
          children: null != t ? t : (0, l.jsx)(n.A, {}),
        });
      }
    },
    5299: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => l });
      let l = (0, r(1847).A)("loader-circle", [
        ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
      ]);
    },
    5915: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => b });
      var l = r(5155),
        o = r(2115),
        n = r(4033),
        s = r(5299),
        a = r(7830),
        c = r(6651),
        i = r(4173),
        u = r(4269);
      let d = o.forwardRef((e, t) => {
        let { className: r, type: o, ...n } = e;
        return (0, l.jsx)("input", {
          type: o,
          className: (0, u.cn)(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            r,
          ),
          ref: t,
          ...n,
        });
      });
      ((d.displayName = "Input"), r(2374));
      var g = r(6264);
      function m(e) {
        let {
            value: t,
            onChange: r,
            onPlaceSelected: n,
            placeholder: s = "Ville, d\xe9partement ou r\xe9gion",
            className: a = "",
            country: c = "fr",
          } = e,
          i = (0, o.useRef)(null),
          u = (0, o.useRef)(null),
          m = (0, o.useRef)(null),
          p = (0, o.useRef)(null),
          f = (0, o.useRef)(null),
          b = (0, o.useRef)(!1),
          h = (0, o.useRef)(null),
          x = (0, o.useRef)(r),
          v = (0, o.useRef)(n);
        ((x.current = r), (v.current = n));
        let { isLoaded: y, requestLoad: w } = (0, g.G)();
        (0, o.useEffect)(() => {
          if (
            i.current &&
            y &&
            "undefined" != typeof google &&
            google.maps &&
            google.maps.places &&
            !u.current
          ) {
            try {
              ((u.current = new google.maps.places.Autocomplete(i.current, {
                componentRestrictions: { country: c },
                fields: [
                  "name",
                  "address_components",
                  "geometry",
                  "formatted_address",
                ],
                types: ["geocode"],
              })),
                (p.current = new google.maps.places.AutocompleteService()));
              let e = document.createElement("div");
              ((f.current = new google.maps.places.PlacesService(e)),
                (h.current = new google.maps.places.AutocompleteSessionToken()),
                (m.current = u.current.addListener("place_changed", () => {
                  var e, t, r;
                  let l = null == (e = u.current) ? void 0 : e.getPlace();
                  if (!l || !l.geometry) return;
                  let o = (null == (t = i.current) ? void 0 : t.value) || "";
                  (x.current(o),
                    null == (r = v.current) || r.call(v, l),
                    setTimeout(() => {
                      var e;
                      let t =
                        null == (e = i.current) ? void 0 : e.closest("form");
                      t &&
                        t.dispatchEvent(
                          new Event("submit", { bubbles: !0, cancelable: !0 }),
                        );
                    }, 100));
                })));
            } catch (e) {
              console.error(
                "[PlacesAutocomplete] Error creating autocomplete:",
                e,
              );
            }
            return () => {
              (m.current &&
                (google.maps.event.removeListener(m.current),
                (m.current = null)),
                u.current &&
                  (google.maps.event.clearInstanceListeners(u.current),
                  (u.current = null)));
            };
          }
        }, [y, c]);
        let j = async (e) => {
          if ("Enter" === e.key) {
            var t, l;
            if (b.current) return void e.preventDefault();
            let o = document.querySelector(".pac-container");
            if (o && "none" !== o.style.display) return;
            let s =
              null == (l = i.current) || null == (t = l.value)
                ? void 0
                : t.trim();
            if (s && p.current && f.current) {
              (e.preventDefault(), (b.current = !0));
              try {
                (h.current ||
                  (h.current =
                    new google.maps.places.AutocompleteSessionToken()),
                  p.current.getPlacePredictions(
                    {
                      input: s,
                      componentRestrictions: { country: c },
                      types: ["geocode"],
                      sessionToken: h.current,
                    },
                    (e, t) => {
                      var l, o;
                      if (
                        t === google.maps.places.PlacesServiceStatus.OK &&
                        e &&
                        e.length > 0
                      )
                        null == (l = f.current) ||
                          l.getDetails(
                            {
                              placeId: e[0].place_id,
                              fields: [
                                "name",
                                "address_components",
                                "geometry",
                                "formatted_address",
                              ],
                              sessionToken: h.current,
                            },
                            (e, t) => {
                              if (
                                ((b.current = !1),
                                (h.current =
                                  new google.maps.places.AutocompleteSessionToken()),
                                t ===
                                  google.maps.places.PlacesServiceStatus.OK &&
                                  e)
                              ) {
                                let t = e.formatted_address || e.name || s;
                                (r(t),
                                  null == n || n(e),
                                  setTimeout(() => {
                                    var e;
                                    let t =
                                      null == (e = i.current)
                                        ? void 0
                                        : e.closest("form");
                                    t &&
                                      t.dispatchEvent(
                                        new Event("submit", {
                                          bubbles: !0,
                                          cancelable: !0,
                                        }),
                                      );
                                  }, 100));
                              } else {
                                var l;
                                let e =
                                  null == (l = i.current)
                                    ? void 0
                                    : l.closest("form");
                                e &&
                                  e.dispatchEvent(
                                    new Event("submit", {
                                      bubbles: !0,
                                      cancelable: !0,
                                    }),
                                  );
                              }
                            },
                          );
                      else {
                        ((b.current = !1),
                          (h.current =
                            new google.maps.places.AutocompleteSessionToken()));
                        let e =
                          null == (o = i.current) ? void 0 : o.closest("form");
                        e &&
                          e.dispatchEvent(
                            new Event("submit", {
                              bubbles: !0,
                              cancelable: !0,
                            }),
                          );
                      }
                    },
                  ));
              } catch (e) {
                ((b.current = !1),
                  (h.current =
                    new google.maps.places.AutocompleteSessionToken()),
                  console.error(
                    "[PlacesAutocomplete] Error getting predictions:",
                    e,
                  ));
              }
            }
          }
        };
        return (0, l.jsx)(d, {
          ref: i,
          type: "text",
          value: t,
          onChange: (e) => {
            r(e.target.value);
          },
          onKeyDown: j,
          onFocus: () => {
            y || w();
          },
          placeholder: s,
          className: a,
          autoComplete: "off",
        });
      }
      var p = r(45),
        f = r(7864);
      let b = (e) => {
        var t;
        let {
            onSearchSubmit: r,
            inline: u = !1,
            clearCity: d,
            initialCity: g,
            resetFilters: b,
            initialSpecialtyId: h,
            country: x = "FR",
          } = e,
          v = "US" === x,
          y = v ? ", USA" : ", France",
          [w, j] = (0, o.useState)(g || ""),
          [N, E] = (0, o.useState)(!1),
          [k, S] = (0, o.useState)(h || null),
          [A, C] = (0, o.useState)(!1),
          [_, L] = (0, o.useState)(!1),
          [R, P] = (0, o.useState)(null),
          [I, T] = (0, o.useState)(null),
          [G, O] = (0, o.useState)(!1),
          z = (0, o.useRef)(null),
          D = (0, o.useRef)(!0),
          U = (0, o.useRef)(null),
          F = (0, o.useRef)({});
        ((0, o.useEffect)(() => {
          j(g || "");
        }, [g]),
          (0, o.useEffect)(() => {
            S(h || null);
          }, [h]),
          (0, o.useEffect)(() => {
            d && (j(""), P(null), (U.current = null), T(null));
          }, [d]),
          (0, o.useEffect)(() => {
            b && (S(null), j(""), P(null), (U.current = null), T(null));
          }, [b]));
        let K = async (e) => {
            (e.preventDefault(), L(!0), O(!0));
            try {
              var t;
              let e,
                l = w.trim() ? U.current || R : null,
                o = [...new Set(Object.values(p.rc))],
                n = Object.values(p.UY),
                s = w.split(",")[0].trim(),
                a = o.some((e) => e.toLowerCase() === s.toLowerCase()),
                c = n.some((e) => e.toLowerCase() === s.toLowerCase());
              if (a || c) {
                let t = await (0, i.iy)();
                if (
                  ((e = a
                    ? t.filter(
                        (e) =>
                          (0, p.pG)(e.codePostal).toLowerCase() ===
                          s.toLowerCase(),
                      )
                    : t.filter(
                        (e) =>
                          (0, p.hl)(e.codePostal).toLowerCase() ===
                          s.toLowerCase(),
                      )),
                  F.current[s])
                )
                  ((l = F.current[s]), P(l), (U.current = l));
                else if (
                  "undefined" != typeof google &&
                  google.maps &&
                  google.maps.Geocoder
                ) {
                  let e = new google.maps.Geocoder();
                  try {
                    let t = await new Promise((t, r) => {
                      e.geocode({ address: s + ", France" }, (e, l) => {
                        "OK" === l && e ? t(e) : r(l);
                      });
                    });
                    if (t && t[0] && t[0].geometry && t[0].geometry.location) {
                      let e = t[0].geometry.location;
                      ((l = { lat: e.lat(), lng: e.lng() }),
                        P(l),
                        (U.current = l),
                        (F.current[s] = l));
                    }
                  } catch (e) {
                    console.error(
                      "Erreur lors du g\xe9ocodage de la r\xe9gion/d\xe9partement:",
                      e,
                    );
                  }
                }
              } else if (l) e = (await (0, i._Q)(l.lat, l.lng)).slice(0, 20);
              else if (w.trim()) {
                let t = w.includes(",") ? w.split(",")[0].trim() : w;
                if (
                  "undefined" != typeof google &&
                  google.maps &&
                  google.maps.Geocoder
                ) {
                  let r = new google.maps.Geocoder();
                  try {
                    let o = await new Promise((e, l) => {
                      r.geocode({ address: t + y }, (t, r) => {
                        "OK" === r && t ? e(t) : l(r);
                      });
                    });
                    if (o && o[0] && o[0].geometry && o[0].geometry.location) {
                      let t = o[0].geometry.location;
                      ((l = { lat: t.lat(), lng: t.lng() }),
                        P(l),
                        (U.current = l),
                        (e = (await (0, i._Q)(l.lat, l.lng)).slice(0, 20)));
                    } else e = await (0, i.I9)(t);
                  } catch (r) {
                    e = await (0, i.I9)(t);
                  }
                } else e = await (0, i.I9)(t);
              } else (P(null), (U.current = null), (e = await (0, i.iy)()));
              if ((I && (e = e.filter((e) => e.codePostal === I)), k)) {
                let t = f.l$.find((e) => e.id === k);
                t &&
                  (e = e.filter(
                    (e) =>
                      !!e.services &&
                      0 !== e.services.length &&
                      e.services.some((e) => t.specialisations.includes(e)),
                  ));
              }
              l && (e = await (0, i.X$)(e, l.lat, l.lng));
              let u = k
                ? null == (t = f.l$.find((e) => e.id === k))
                  ? void 0
                  : t.label
                : void 0;
              r(e, w || "", u, l, I);
            } catch (e) {
              (console.error("Erreur lors de la recherche:", e),
                alert(
                  v
                    ? "An error occurred during the search. Please try again."
                    : "Une erreur est survenue lors de la recherche. Veuillez r\xe9essayer.",
                ));
            } finally {
              L(!1);
            }
          },
          V = (e) => {
            (S(e === k ? null : e), E(!1));
          };
        ((0, o.useEffect)(() => {
          if (D.current) {
            D.current = !1;
            return;
          }
          G && (w.trim() || R) && K({ preventDefault: () => {} });
        }, [k]),
          (0, o.useEffect)(() => {
            let e = (e) => {
              z.current && !z.current.contains(e.target) && E(!1);
            };
            return (
              document.addEventListener("mousedown", e),
              () => document.removeEventListener("mousedown", e)
            );
          }, []));
        let M = k
            ? null == (t = f.l$.find((e) => e.id === k))
              ? void 0
              : t.label
            : v
              ? "Medical specialties"
              : "Sp\xe9cialit\xe9s m\xe9dicales",
          $ = (0, l.jsxs)("form", {
            onSubmit: K,
            className:
              "flex flex-col lg:flex-row gap-4 md:gap-[1.2rem] items-stretch",
            children: [
              (0, l.jsxs)("div", {
                className: "w-full md:min-w-[280px] md:w-auto relative",
                ref: z,
                children: [
                  (0, l.jsxs)("button", {
                    type: "button",
                    onClick: () => E(!N),
                    className:
                      "w-full h-11 flex items-center font-semibold justify-between space-x-2 border rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer ".concat(
                        k
                          ? "border-tessan-green bg-tessan-green text-white"
                          : "border-tessan-green-hover text-tessan-green-hover hover:bg-tessan-green-hover hover:text-white",
                      ),
                    children: [
                      (0, l.jsx)("span", {
                        className: "truncate",
                        children: M,
                      }),
                      (0, l.jsx)(n.A, {
                        size: 20,
                        className: "transition-transform ".concat(
                          N ? "rotate-180" : "",
                        ),
                      }),
                    ],
                  }),
                  N &&
                    (0, l.jsxs)("div", {
                      className:
                        "absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden",
                      children: [
                        f.l$.map((e) =>
                          (0, l.jsxs)(
                            "button",
                            {
                              type: "button",
                              onClick: () => V(e.id),
                              className:
                                "w-full text-left px-4 py-3 hover:bg-tessan-green/10 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer ".concat(
                                  k === e.id ? "bg-tessan-green/10" : "",
                                ),
                              children: [
                                (0, l.jsxs)("div", {
                                  className:
                                    "font-semibold text-gray-800 flex items-center justify-between",
                                  children: [
                                    (0, l.jsx)("span", { children: e.label }),
                                    k === e.id &&
                                      (0, l.jsx)("span", {
                                        className: "text-tessan-green",
                                        children: "✓",
                                      }),
                                  ],
                                }),
                                (0, l.jsx)("div", {
                                  className: "text-xs text-gray-500 mt-1",
                                  children: e.description,
                                }),
                              ],
                            },
                            e.id,
                          ),
                        ),
                        k &&
                          (0, l.jsx)("button", {
                            type: "button",
                            onClick: () => V(""),
                            className:
                              "w-full text-left px-4 py-2 text-sm text-tessan-green-hover hover:bg-gray-50 border-t border-gray-200 cursor-pointer",
                            children: v ? "Clear filter" : "Effacer le filtre",
                          }),
                      ],
                    }),
                ],
              }),
              (0, l.jsxs)("div", {
                className: "relative flex-1",
                children: [
                  (0, l.jsx)(m, {
                    value: w,
                    country: v ? "us" : "fr",
                    onChange: (e) => {
                      (j(e),
                        e.trim() || (P(null), (U.current = null), T(null)));
                    },
                    onPlaceSelected: (e) => {
                      if (e.geometry && e.geometry.location) {
                        let t = {
                          lat: e.geometry.location.lat(),
                          lng: e.geometry.location.lng(),
                        };
                        ((U.current = t), P(t));
                      }
                      let t = null;
                      if (e.address_components) {
                        for (let r of e.address_components)
                          if (r.types.includes("postal_code")) {
                            t = r.long_name;
                            break;
                          }
                      }
                      T(t);
                    },
                    placeholder: v ? "City / ZIP code" : "Ville / Code postal",
                    className:
                      "w-full h-11 border border-gray-300 placeholder-gray-700 rounded-lg px-4 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-300",
                  }),
                  w &&
                    (0, l.jsx)("button", {
                      type: "button",
                      onClick: async () => {
                        (j(""), P(null), (U.current = null), T(null), L(!0));
                        try {
                          let e = await (0, i.iy)();
                          r(e, "", void 0, null, null);
                        } catch (e) {
                          console.error(
                            "Erreur lors de la r\xe9initialisation:",
                            e,
                          );
                        } finally {
                          L(!1);
                        }
                      },
                      className:
                        "absolute top-1/2 right-12 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer",
                      title: v ? "Clear search" : "Effacer la recherche",
                      children: (0, l.jsxs)("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        width: "20",
                        height: "20",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        children: [
                          (0, l.jsx)("line", {
                            x1: "18",
                            y1: "6",
                            x2: "6",
                            y2: "18",
                          }),
                          (0, l.jsx)("line", {
                            x1: "6",
                            y1: "6",
                            x2: "18",
                            y2: "18",
                          }),
                        ],
                      }),
                    }),
                  (0, l.jsx)("button", {
                    type: "button",
                    onClick: () => {
                      if (!navigator.geolocation)
                        return void alert(
                          v
                            ? "Geolocation is not supported by your browser"
                            : "La g\xe9olocalisation n'est pas support\xe9e par votre navigateur",
                        );
                      (C(!0),
                        navigator.geolocation.getCurrentPosition(
                          (e) => {
                            let { latitude: t, longitude: r } = e.coords,
                              l = { lat: t, lng: r };
                            (P(l),
                            (U.current = l),
                            "undefined" != typeof google &&
                              google.maps &&
                              google.maps.Geocoder)
                              ? new google.maps.Geocoder().geocode(
                                  { location: { lat: t, lng: r } },
                                  (e, t) => {
                                    if ((C(!1), "OK" === t && e && e[0])) {
                                      let t = e[0].address_components,
                                        r = "",
                                        l = "";
                                      for (let e of t)
                                        (e.types.includes("locality") &&
                                          (r = e.long_name),
                                          e.types.includes("postal_code") &&
                                            (l = e.long_name));
                                      (l && T(l),
                                        j(r || l || e[0].formatted_address));
                                    } else
                                      alert(
                                        v
                                          ? "Unable to determine your address"
                                          : "Impossible de d\xe9terminer votre adresse",
                                      );
                                  },
                                )
                              : (C(!1),
                                alert(
                                  v
                                    ? "Geolocation service is not available"
                                    : "Le service de g\xe9olocalisation n'est pas disponible",
                                ));
                          },
                          (e) => {
                            C(!1);
                            let t = v
                              ? "Geolocation error"
                              : "Erreur de g\xe9olocalisation";
                            switch (e.code) {
                              case e.PERMISSION_DENIED:
                                t = v
                                  ? "You denied access to your location"
                                  : "Vous avez refus\xe9 l'acc\xe8s \xe0 votre position";
                                break;
                              case e.POSITION_UNAVAILABLE:
                                t = v
                                  ? "Your location is unavailable"
                                  : "Votre position n'est pas disponible";
                                break;
                              case e.TIMEOUT:
                                t = v
                                  ? "The geolocation request timed out"
                                  : "La demande de g\xe9olocalisation a expir\xe9";
                            }
                            alert(t);
                          },
                        ));
                    },
                    disabled: A,
                    className:
                      "absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-tessan-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    title: v ? "Use my location" : "Me g\xe9olocaliser",
                    children: A
                      ? (0, l.jsx)(s.A, { className: "animate-spin", size: 20 })
                      : (0, l.jsx)(a.A, { size: 20 }),
                  }),
                ],
              }),
              (0, l.jsx)("button", {
                type: "submit",
                disabled: _,
                className:
                  "w-full md:min-w-[288px] md:w-auto h-11 flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-semibold rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                children: _
                  ? (0, l.jsxs)(l.Fragment, {
                      children: [
                        (0, l.jsx)(s.A, {
                          className: "animate-spin",
                          size: 20,
                        }),
                        (0, l.jsx)("span", {
                          children: v ? "Searching..." : "Recherche...",
                        }),
                      ],
                    })
                  : (0, l.jsxs)(l.Fragment, {
                      children: [
                        (0, l.jsx)(c.A, { size: 20 }),
                        (0, l.jsx)("span", {
                          children: v ? "Search" : "Recherche",
                        }),
                      ],
                    }),
              }),
            ],
          });
        return u
          ? $
          : (0, l.jsx)("section", {
              className: "py-12 md:py-20 bg-slate-50",
              children: (0, l.jsxs)("div", {
                className: "max-w-[1328px] mx-auto px-4 text-center",
                children: [
                  (0, l.jsxs)("h1", {
                    className: "text-2xl md:text-3xl font-bold text-gray-800",
                    children: [
                      "Trouver ",
                      (0, l.jsx)("span", {
                        className: "text-tessan-green-hover",
                        children: "une t\xe9l\xe9consultation",
                      }),
                      " avec un m\xe9decin",
                    ],
                  }),
                  (0, l.jsx)("div", {
                    className:
                      "mt-8 md:mt-10 mx-auto bg-white p-4 md:p-6 lg:p-8 rounded-lg shadow-lg",
                    children: $,
                  }),
                ],
              }),
            });
      };
    },
    6651: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => l });
      let l = (0, r(1847).A)("search", [
        ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
        ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
      ]);
    },
    7937: (e, t, r) => {
      "use strict";
      r.d(t, { A: () => l });
      let l = (0, r(1847).A)("chevron-right", [
        ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }],
      ]);
    },
  },
]);
